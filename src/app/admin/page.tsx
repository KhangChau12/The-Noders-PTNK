'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { formatDay, formatMonth } from '@/lib/dashboard'
import { hasWriteup, nameOf, profileGaps } from '@/lib/admin'
import { cn } from '@/lib/utils'

interface Item {
  id: string
  tone: 'red' | 'amber' | 'grey'
  title: string
  why: string
  href: string
  action: string
}

const DISMISS_KEY = 'admin-dismissed'
const DAY = 86400000

function readDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]')
  } catch {
    return []
  }
}

export default function AdminOverview() {
  const { data, ready } = useAdmin()
  const [dismissed, setDismissed] = useState<string[]>([])
  useEffect(() => setDismissed(readDismissed()), [])

  const published = useMemo(() => data.posts.filter((p) => p.status === 'published'), [data.posts])

  // The queue: only things someone can act on, built from live data
  const items = useMemo<Item[]>(() => {
    const out: Item[] = []
    const now = Date.now()
    if (data.batches === null) {
      out.push({ id: 'mig-027', tone: 'red', title: 'Database migration 027 hasn’t been run', why: 'Certificate batches, awards and post-linked points need it. Run supabase/migrations/027 in the SQL editor.', href: '/admin/certificates', action: 'Details' })
    }
    for (const p of data.products.filter((x) => x.featured && !hasWriteup(x))) {
      out.push({ id: `feat-${p.id}`, tone: 'red', title: `${p.title} is on the homepage but has no write-up`, why: `Visitors who click it land on an empty page. Added by ${nameOf(data, p.created_by)}.`, href: '/admin/products', action: 'Open products' })
    }
    const last = published[0]?.published_at
    if (last && now - new Date(last).getTime() > 60 * DAY) {
      const months = Math.floor((now - new Date(last).getTime()) / (30 * DAY))
      out.push({ id: `quiet-${last.slice(0, 10)}`, tone: 'amber', title: `Nothing has been published for ${months} months`, why: `The last post went out on ${formatDay(last)}.`, href: '/admin/posts', action: 'See who writes' })
    }
    for (const d of data.posts.filter((p) => p.status === 'draft' && now - new Date(p.updated_at || p.created_at).getTime() > 30 * DAY).slice(0, 3)) {
      out.push({ id: `draft-${d.id}`, tone: 'amber', title: `${nameOf(data, d.author_id)}’s draft has been waiting since ${formatDay(d.updated_at || d.created_at)}`, why: `“${d.title}”`, href: `/dashboard/posts/${d.id}/edit`, action: 'Open draft' })
    }
    const noWriteup = data.products.filter((p) => !p.featured && !hasWriteup(p))
    if (noWriteup.length) {
      out.push({ id: `pages-${noWriteup.map((p) => p.id).join()}`, tone: 'grey', title: `${noWriteup.length} product page${noWriteup.length > 1 ? 's have' : ' has'} no write-up`, why: noWriteup.map((p) => p.title).join(', ') + '.', href: '/admin/products?show=incomplete', action: 'See which' })
    }
    const gaps = data.members.map(profileGaps)
    const noPhoto = gaps.filter((g) => !g.photo).length
    const noBio = gaps.filter((g) => !g.bio).length
    if (noPhoto || noBio) {
      out.push({ id: `profiles-${noPhoto}-${noBio}`, tone: 'grey', title: [noPhoto && `${noPhoto} member${noPhoto > 1 ? 's have' : ' has'} no photo`, noBio && `${noBio} still show the default bio`].filter(Boolean).join(', '), why: 'They appear as initials and “Member of Generation …” on the Members page.', href: '/admin/users?show=incomplete', action: 'See who' })
    }
    return out
  }, [data, published])

  const open = items.filter((i) => !dismissed.includes(i.id))
  const dismiss = (id: string) => {
    const next = [...dismissed, id]
    setDismissed(next)
    try {
      localStorage.setItem(DISMISS_KEY, JSON.stringify(next))
    } catch {}
  }

  // Posts per month, last 14 months
  const months = useMemo(() => {
    const now = new Date()
    const out: { key: string; label: string; n: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      const key = d.toISOString().slice(0, 7)
      out.push({ key, label: formatMonth(d.toISOString()), n: published.filter((p) => (p.published_at || '').startsWith(key)).length })
    }
    return out
  }, [published])
  const maxMonth = Math.max(1, ...months.map((m) => m.n))
  const peak = months.reduce((a, b) => (b.n > a.n ? b : a), months[0])
  const writers = new Set(published.map((p) => p.author_id)).size

  const feed = useMemo(() => {
    const rows: { date: string; kind: string; tone: string; title: string; who: string; href: string }[] = []
    for (const p of published.slice(0, 8)) rows.push({ date: p.published_at!, kind: 'Post', tone: 'text-text-secondary', title: p.title, who: nameOf(data, p.author_id), href: `/posts/${p.slug}` })
    for (const p of data.products) rows.push({ date: p.created_at, kind: 'Product', tone: 'text-link', title: p.title, who: nameOf(data, p.created_by), href: `/products/${p.id}` })
    for (const m of data.members) rows.push({ date: m.created_at, kind: 'Member', tone: 'text-[#6FD39F]', title: `${m.full_name} joined`, who: m.role === 'admin' ? 'Core team' : 'Member', href: `/members/${m.id}` })
    const byBatch = new Map<string, { date: string; n: number; title: string }>()
    for (const c of data.certificates) {
      const key = c.batch_id || `${c.title.replace(/^(Gold|Silver|Bronze) Medal |participant /i, '')}|${c.issued_at.slice(0, 10)}`
      const b = byBatch.get(key) || { date: c.issued_at, n: 0, title: (data.batches || []).find((x) => x.id === c.batch_id)?.event_name || c.title }
      b.n++
      byBatch.set(key, b)
    }
    byBatch.forEach((b) => rows.push({ date: b.date, kind: 'Certificates', tone: 'text-[#E0B26A]', title: `${b.n} × ${b.title}`, who: 'Core team', href: '/admin/certificates' }))
    return rows.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)
  }, [data, published])

  if (!ready) return <div aria-busy="true" className="h-[480px] animate-pulse rounded-xl bg-paper" />

  const dot = { red: 'bg-[#FF9C85]', amber: 'bg-signal', grey: 'bg-[#4A5060]' }
  const views = published.reduce((s, p) => s + p.view_count, 0)
  const core = data.members.filter((m) => m.role === 'admin').length
  const featured = data.products.filter((p) => p.featured).length

  return (
    <>
      <div className="flex flex-wrap items-start gap-6">
        <section aria-labelledby="queue" className="min-w-0 flex-[1_1_640px]">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="queue" className="text-[22px] font-bold tracking-[-0.01em]">
              Needs a decision <span className="font-mono text-[15px] font-normal text-text-tertiary">{open.length}</span>
            </h2>
            <span className="text-[13px] text-text-disabled">Built from live data — items disappear when fixed</span>
          </div>
          {open.length ? (
            <ul className="flex flex-col gap-2.5">
              {open.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl bg-paper px-5 py-[18px]">
                  <span aria-hidden="true" className={cn('h-2 w-2 shrink-0 rounded-full', dot[i.tone])} />
                  <div className="min-w-0 flex-[1_1_360px]">
                    <p className="font-semibold">{i.title}</p>
                    <p className="mt-0.5 text-sm text-text-tertiary">{i.why}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={i.href} className="inline-flex min-h-[36px] items-center rounded-md bg-text-primary px-3 text-sm font-semibold text-ink hover:bg-white">
                      {i.action}
                    </Link>
                    <button type="button" onClick={() => dismiss(i.id)} className="min-h-[36px] px-2.5 text-sm font-semibold text-text-tertiary hover:text-text-primary">
                      Dismiss
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl bg-paper px-5 py-6 text-text-secondary">Nothing waiting. New issues show up here on their own.</p>
          )}
        </section>

        <aside aria-label="At a glance" className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
          <h2 className="text-[22px] font-bold tracking-[-0.01em]">At a glance</h2>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-rule">
            {[
              [data.members.length, `members · ${core} core team`],
              [published.length, `published posts · ${views.toLocaleString('en-US')} views`],
              [data.products.length, `products · ${featured} featured`],
              [data.certificates.length, 'certificates issued'],
            ].map(([n, l]) => (
              <div key={l as string} className="flex flex-col-reverse bg-paper px-[18px] py-4">
                <dt className="text-[13px] text-text-tertiary">{l}</dt>
                <dd className="font-mono text-[26px]">{n}</dd>
              </div>
            ))}
          </dl>
          <figure className="rounded-xl bg-paper px-[22px] py-5">
            <figcaption className="mb-3.5 flex items-baseline justify-between">
              <span className="font-semibold">Posts published per month</span>
              {months.slice(-3).every((m) => !m.n) && <span className="text-[13px] text-signal">none in 3 months</span>}
            </figcaption>
            <div role="img" aria-label={`Posts per month: ${months.map((m) => `${m.label} ${m.n}`).join(', ')}`} className="flex h-[120px] items-end gap-[5px] border-b border-control">
              {months.map((m) => (
                <span key={m.key} title={`${m.label} · ${m.n} posts`} className={cn('flex-1 rounded-t-sm', m.n ? 'bg-[#5B7FD6]' : 'bg-control')} style={{ height: m.n ? `${Math.max(3, Math.round((m.n / maxMonth) * 116))}px` : '2px' }} />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-xs text-text-disabled">
              <span>{months[0].label}</span>
              <span>{months[months.length - 1].label}</span>
            </div>
            <p className="mt-3 text-sm text-text-tertiary">
              {peak.n > 0 && `${peak.n} of the ${published.length} posts went out in ${peak.label}. `}
              {writers} member{writers === 1 ? ' has' : 's have'} written at least one.
            </p>
          </figure>
        </aside>
      </div>

      <section aria-labelledby="recent" className="mt-12">
        <h2 id="recent" className="mb-2 text-[22px] font-bold tracking-[-0.01em]">Latest on the site</h2>
        <ul className="border-b border-rule">
          {feed.map((r, i) => (
            <li key={i} className="border-t border-rule">
              <Link href={r.href} className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-x-4 gap-y-0.5 px-2 py-3 text-text-primary hover:bg-[#12151B] md:grid-cols-[104px_100px_minmax(0,1fr)_200px]">
                <span className="font-mono text-[13px] text-text-tertiary">{formatDay(r.date)}</span>
                <span className={cn('hidden text-[13px] font-semibold md:block', r.tone)}>{r.kind}</span>
                <span className="truncate font-semibold">{r.title}</span>
                <span className="col-start-2 truncate text-sm text-text-tertiary md:col-start-auto">{r.who}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
