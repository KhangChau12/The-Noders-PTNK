'use client'

import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { useToast } from '@/components/Toast'
import { btnPrimary } from '@/components/dashboard/ui'
import { AdminPost, median, nameOf } from '@/lib/admin'
import { POST_CATEGORIES } from '@/lib/constants'
import { formatDay, topicOf } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

type Tab = 'published' | 'draft' | 'archived'
const POST_TASK = 'Write web post'

export default function PostsAdminPage() {
  return (
    <Suspense>
      <PostsAdmin />
    </Suspense>
  )
}

function PostsAdmin() {
  const { data, ready, refresh, api } = useAdmin()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('published')
  const [q, setQ] = useState('')
  const [topic, setTopic] = useState('')
  const [awarding, setAwarding] = useState<string | null>(null)
  const [pts, setPts] = useState('')
  const [busy, setBusy] = useState(false)

  const template = data.templates.find((t) => t.name === POST_TASK)
  const postLogs = data.logs.filter((l) => l.task_name === POST_TASK)
  const suggested = median(postLogs.map((l) => l.points)) || 30
  const loggedFor = useMemo(() => new Map(data.logs.filter((l) => l.post_id).map((l) => [l.post_id!, l.points])), [data.logs])
  const unlinked = postLogs.filter((l) => !l.post_id).length

  const counts = { published: 0, draft: 0, archived: 0 } as Record<Tab, number>
  data.posts.forEach((p) => (counts[p.status] += 1))

  let rows = data.posts.filter((p) => p.status === tab)
  if (topic) rows = rows.filter((p) => p.category === topic)
  if (q) {
    const s = q.toLowerCase()
    rows = rows.filter((p) => p.title.toLowerCase().includes(s) || nameOf(data, p.author_id).toLowerCase().includes(s))
  }

  const writers = useMemo(() => {
    const m = new Map<string, number>()
    data.posts.filter((p) => p.status === 'published').forEach((p) => m.set(p.author_id, (m.get(p.author_id) || 0) + 1))
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1])
  }, [data.posts])
  const silent = data.members.length - writers.length

  const award = async (p: AdminPost) => {
    const n = parseInt(pts, 10)
    if (!Number.isInteger(n) || n < 0) return
    setBusy(true)
    try {
      await api('/api/admin/activity', {
        method: 'POST',
        body: { ...(template ? { templateId: template.id } : { taskName: POST_TASK }), points: n, memberIds: [p.author_id], postId: p.id },
      })
      showToast('success', `${n} points logged for ${nameOf(data, p.author_id)}`)
      setAwarding(null)
      refresh()
    } catch (e: any) {
      showToast('error', e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return <div aria-busy="true" className="h-[480px] animate-pulse rounded-xl bg-paper" />
  const maxW = writers[0]?.[1] || 1

  return (
    <div className="flex flex-wrap items-start gap-x-12 gap-y-8">
      <section aria-label="Posts" className="min-w-0 flex-[1_1_760px]">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3 border-b border-rule">
          <div role="tablist" aria-label="Status" className="flex gap-[22px] text-[15px] font-medium">
            {(['published', 'draft', 'archived'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn('-mb-px border-b-2 pb-3 pt-2.5', tab === t ? 'border-link text-white' : 'border-transparent text-text-secondary hover:text-text-primary')}
              >
                {t === 'draft' ? 'Drafts' : t[0].toUpperCase() + t.slice(1)} <span className="font-mono text-[13px] text-text-tertiary">{counts[t]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pb-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Title or author"
              aria-label="Search posts"
              className="min-h-[36px] w-[200px] rounded-md border border-control bg-paper px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-link focus:outline-none"
            />
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              aria-label="Topic"
              className="min-h-[36px] rounded-md border border-control bg-paper px-2.5 text-sm text-text-secondary focus:border-link focus:outline-none"
            >
              <option value="">All topics</option>
              {POST_CATEGORIES.map((c) => (
                <option key={c} value={c}>{topicOf(c).label}</option>
              ))}
            </select>
          </div>
        </div>

        <ul>
          {rows.map((p) => {
            const t = topicOf(p.category)
            const logged = loggedFor.get(p.id)
            const open = awarding === p.id
            return (
              <li key={p.id} className="border-b border-rule">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-1.5 py-[11px] hover:bg-[#12151B] md:grid-cols-[92px_minmax(0,1fr)_48px_160px]">
                  <span className="col-span-2 font-mono text-[13px] text-text-tertiary md:col-span-1">
                    {formatDay(p.status === 'draft' ? p.updated_at || p.created_at : p.published_at || p.created_at)}
                  </span>
                  <span className="min-w-0">
                    <Link href={`/dashboard/posts/${p.id}/edit`} className="block truncate font-semibold text-text-primary hover:text-link">{p.title}</Link>
                    <span className="text-[13px] text-text-tertiary">
                      <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-sm" style={{ background: t.color }} />
                      {t.label} · {nameOf(data, p.author_id)}
                    </span>
                  </span>
                  <span className={cn('hidden text-right font-mono text-sm md:block', p.status === 'published' ? 'text-text-primary' : 'text-text-disabled')}>
                    {p.status === 'published' ? p.view_count : '—'}
                  </span>
                  <span className="flex justify-end">
                    {p.status === 'published' ? (
                      logged !== undefined ? (
                        <span className="text-[13px] text-[#6FD39F]">✓ {logged} pts logged</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setAwarding(open ? null : p.id); setPts(String(suggested)) }}
                          aria-expanded={open}
                          className="min-h-[32px] rounded-md border border-control px-2.5 text-[13px] font-semibold text-text-primary hover:border-text-tertiary"
                        >
                          Award points
                        </button>
                      )
                    ) : p.status === 'draft' ? (
                      <Link href={`/dashboard/posts/${p.id}/edit`} className="text-[13px] font-semibold text-signal">Review draft →</Link>
                    ) : null}
                  </span>
                </div>
                {open && (
                  <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-[10px] bg-paper px-4 py-3.5 md:ml-[108px]">
                    <span className="text-sm text-text-secondary">
                      <b className="text-text-primary">{POST_TASK}</b> → {nameOf(data, p.author_id)}
                    </span>
                    <label className="flex items-center gap-2 text-sm text-text-tertiary">
                      Points
                      <input
                        autoFocus
                        value={pts}
                        onChange={(e) => setPts(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        onKeyDown={(e) => e.key === 'Enter' && award(p)}
                        inputMode="numeric"
                        className="min-h-[34px] w-16 rounded-md border border-control bg-ink px-2 text-right font-mono text-text-primary focus:border-link focus:outline-none"
                      />
                    </label>
                    {postLogs.length > 0 && (
                      <span className="text-[13px] text-text-disabled">
                        Past posts got {Math.min(...postLogs.map((l) => l.points))}–{Math.max(...postLogs.map((l) => l.points))}, median {suggested}
                      </span>
                    )}
                    <span className="flex-auto" />
                    <button type="button" onClick={() => setAwarding(null)} className="px-2.5 text-sm font-semibold text-text-tertiary hover:text-text-primary">Cancel</button>
                    <button type="button" onClick={() => award(p)} disabled={busy || !pts} className={cn(btnPrimary, 'min-h-[34px]')}>
                      {busy ? 'Logging…' : `Log ${pts || 0} points`}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
          {rows.length === 0 && <li className="px-1.5 py-8 text-text-tertiary">{q || topic ? 'No posts match.' : tab === 'draft' ? 'No drafts.' : 'Nothing archived.'}</li>}
        </ul>
        <p className="mt-3.5 text-[13px] text-text-disabled">
          Points logged from here remember their post, so a post can’t be rewarded twice.
          {unlinked > 0 && ` The ${unlinked} older “${POST_TASK}” log${unlinked > 1 ? 's aren’t' : ' isn’t'} linked to a post.`}
        </p>
      </section>

      <aside aria-labelledby="writers" className="min-w-0 flex-[0_1_340px] rounded-xl bg-paper px-6 py-[22px]">
        <h2 id="writers" className="mb-1 text-lg font-bold">Who writes</h2>
        <p className="mb-4 text-sm text-text-tertiary">
          Published posts per member · {writers.length} of {data.members.length} have written
        </p>
        <ol className="flex flex-col gap-[9px]">
          {writers.slice(0, 12).map(([id, n]) => (
            <li key={id} className="grid grid-cols-[minmax(0,1fr)_90px_24px] items-center gap-2.5 text-sm">
              <Link href={`/members/${id}`} className="truncate text-text-primary hover:text-link">{nameOf(data, id)}</Link>
              <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-[3px] bg-rule">
                <span className="block h-full bg-[#5B7FD6]" style={{ width: `${Math.round((n / maxW) * 100)}%` }} />
              </span>
              <span className="text-right font-mono">{n}</span>
            </li>
          ))}
        </ol>
        {silent > 0 && (
          <p className="mt-4 border-t border-[#2A2E37] pt-3.5 text-sm text-text-tertiary">
            {silent} member{silent > 1 ? 's haven’t' : ' hasn’t'} written yet.{' '}
            <Link href="/admin/users" className="font-semibold text-link hover:text-text-primary">See who →</Link>
          </p>
        )}
      </aside>
    </div>
  )
}
