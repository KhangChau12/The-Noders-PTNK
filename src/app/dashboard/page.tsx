'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { MemberAvatar, SectionHeading, Segments, btnPrimary } from '@/components/dashboard/ui'
import { createClient } from '@/lib/supabase'
import { CONTESTS, COURSES } from '@/lib/programs'
import { isDefaultBio } from '@/lib/memberSummary'
import {
  DashPost,
  DashProduct,
  describeCertificate,
  doneCount,
  formatMonth,
  productChecklist,
  topicOf,
} from '@/lib/dashboard'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'

export default function DashboardOverview() {
  const { profile } = useAuth()
  const { data, ready } = useDashboard()

  if (!ready || !profile) return <OverviewSkeleton />

  const published = data.posts.filter((p) => p.status === 'published')
  const isNewcomer = data.products.length === 0 && published.length === 0 && data.certificates.length === 0
  return isNewcomer ? <NewcomerOverview profile={profile} /> : <MemberOverview profile={profile} />
}

/* ------------------------------------------------------------------ */
/* Members with work: what to do next, how it's doing                  */
/* ------------------------------------------------------------------ */

function profileGaps(profile: Profile) {
  const links = profile.social_links || {}
  const gaps: { title: string; href: string; action: string }[] = []
  if (!profile.avatar_url) gaps.push({ title: 'Your profile has no photo', href: '/dashboard/profile', action: 'Add' })
  if (isDefaultBio(profile.bio)) gaps.push({ title: 'Your profile has no bio', href: '/dashboard/profile', action: 'Write one' })
  if (!links.linkedin && !links.github) gaps.push({ title: 'Your profile has no GitHub or LinkedIn link', href: '/dashboard/profile', action: 'Add' })
  else if (!links.linkedin) gaps.push({ title: 'Your profile has no LinkedIn link', href: '/dashboard/profile', action: 'Add' })
  return gaps
}

function MemberOverview({ profile }: { profile: Profile }) {
  const { data } = useDashboard()
  const published = data.posts.filter((p) => p.status === 'published')
  const drafts = data.posts.filter((p) => p.status === 'draft')

  // The product page that most needs work leads; ties go to the newest.
  const unfinished = data.products.filter((p) => doneCount(p) < 4).sort((a, b) => doneCount(a) - doneCount(b))
  const lead = unfinished[0]
  const noVideo = data.products.filter((p) => !p.video_url && p.id !== lead?.id)

  const todos: { title: string; note?: string; href: string; action: string }[] = []
  if (drafts.length) {
    todos.push({ title: `${drafts.length} draft${drafts.length > 1 ? 's' : ''} not published yet`, href: '/dashboard/posts?tab=draft', action: 'Open' })
  }
  todos.push(...profileGaps(profile))
  if (noVideo.length && !(lead && productChecklist(lead).find((c) => c.key === 'video' && !c.done))) {
    todos.push({ title: `${noVideo.length} product${noVideo.length > 1 ? 's have' : ' has'} no walkthrough video`, note: 'optional', href: '/dashboard/products?show=todo', action: 'See which' })
  }

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-wrap items-stretch gap-6">
        <section aria-labelledby="next" className="flex min-w-0 flex-[1_1_620px] flex-col gap-3">
          <h2 id="next" className="text-sm font-semibold text-text-secondary">Next up</h2>
          {lead ? (
            <NextProductCard product={lead} />
          ) : (
            <div className="flex-auto rounded-[14px] bg-paper p-7">
              <p className="mb-1 text-[13px] font-semibold text-[#6FD39F]">All product pages complete</p>
              <h3 className="text-[22px] font-bold leading-tight">Nothing is waiting on you.</h3>
              <p className="mt-1.5 text-sm text-text-tertiary">Every product you’re credited on has a write-up, a link, a video and a screenshot.</p>
            </div>
          )}
          {todos.length > 0 && (
            <ul className="flex flex-col gap-2">
              {todos.slice(0, 3).map((t) => (
                <li key={t.title}>
                  <Link href={t.href} className="flex flex-wrap justify-between gap-x-4 gap-y-1 rounded-[10px] border border-rule px-[18px] py-3.5 text-[15px] text-text-primary transition-colors hover:border-control">
                    <span>
                      {t.title}
                      {t.note && <span className="text-text-tertiary"> · {t.note}</span>}
                    </span>
                    <span className="text-sm font-semibold text-link">{t.action} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <ReachCard posts={published} />
      </div>

      {data.products.length > 0 && (
        <section aria-labelledby="prods">
          <SectionHeading id="prods" action={{ href: '/dashboard/products', label: 'Manage all' }}>
            Your products
          </SectionHeading>
          <ul className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr))]">
            {data.products.slice(0, 4).map((p) => (
              <li key={p.id}>
                <ProductTile product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap items-start gap-x-12 gap-y-10">
        {published.length > 0 && <MostRead posts={published} />}
        <CertificateTeaser />
      </div>
    </div>
  )
}

function NextProductCard({ product }: { product: DashProduct }) {
  const checks = productChecklist(product)
  const missing = checks.filter((c) => !c.done)
  const why = !checks[0].done
    ? 'Visitors land on a title and nothing else. A few paragraphs on what it does and how it works make the page worth sharing.'
    : !checks[1].done
      ? 'Visitors can read about it but can’t try it. Add the URL if it’s deployed.'
      : !checks[3].done
        ? 'Product cards without a screenshot show an empty frame on the Products page.'
        : 'A short walkthrough video gets a player beside the write-up.'
  return (
    <article className="flex flex-auto flex-wrap overflow-hidden rounded-[14px] bg-paper">
      <div className="relative min-h-[220px] min-w-0 flex-[1_1_260px] bg-ink">
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-text-disabled">No screenshot yet</span>
        )}
      </div>
      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 px-[26px] py-6">
        <div>
          <p className="mb-1 text-[13px] font-semibold text-signal">{4 - missing.length} of 4 done</p>
          <h3 className="text-[22px] font-bold leading-tight">Finish the {product.title} page</h3>
          <p className="mt-1.5 text-sm text-text-tertiary">{why}</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {checks.map((c) => (
            <li key={c.key} className={cn('flex gap-2', c.done ? 'text-text-tertiary' : 'text-signal')}>
              <span aria-hidden="true" className={c.done ? 'text-[#6FD39F]' : ''}>{c.done ? '✓' : '○'}</span>
              {c.label}
              <span className="sr-only">{c.done ? ' — done' : ' — missing'}</span>
            </li>
          ))}
        </ul>
        <Link href={`/dashboard/products/${product.id}/edit`} className={cn(btnPrimary, 'mt-auto self-start')}>
          Open the editor
        </Link>
      </div>
    </article>
  )
}

function ReachCard({ posts }: { posts: DashPost[] }) {
  const { data } = useDashboard()
  const views = posts.reduce((s, p) => s + p.view_count, 0)
  const upvotes = posts.reduce((s, p) => s + p.upvote_count, 0)
  const ordered = [...posts].sort((a, b) => (a.published_at || a.created_at).localeCompare(b.published_at || b.created_at))
  const max = Math.max(1, ...ordered.map((p) => p.view_count))
  const topics = Array.from(new Set(ordered.map((p) => p.category)))
  const top = [...posts].sort((a, b) => b.view_count - a.view_count)[0]

  return (
    <section aria-labelledby="reach" className="flex min-w-0 flex-[1_1_380px] flex-col gap-3">
      <h2 id="reach" className="text-sm font-semibold text-text-secondary">Your reach</h2>
      <div className="flex flex-auto flex-col rounded-[14px] bg-paper px-[26px] py-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-5xl leading-none tracking-[-0.03em]">{views.toLocaleString('en-US')}</span>
          <span className="text-text-tertiary">
            views across {posts.length} post{posts.length === 1 ? '' : 's'}
          </span>
        </div>
        {ordered.length > 0 && (
          <figure className="mt-6">
            <div
              role="img"
              aria-label={`Views per post, oldest to newest.${top ? ` Most read: ${top.title}, ${top.view_count} views.` : ''}`}
              className="flex h-[140px] items-end gap-1.5 border-b border-control"
            >
              {ordered.map((p) => (
                <span
                  key={p.id}
                  title={`${p.title} · ${p.view_count} views`}
                  className="min-w-[3px] flex-1 rounded-t-[3px]"
                  style={{ height: `${Math.max(2, Math.round((p.view_count / max) * 136))}px`, background: topicOf(p.category).color }}
                />
              ))}
            </div>
            <figcaption className="mt-1.5 flex justify-between font-mono text-xs text-text-disabled">
              <span>{formatMonth(ordered[0].published_at || ordered[0].created_at)}</span>
              <span>{formatMonth(ordered[ordered.length - 1].published_at || ordered[ordered.length - 1].created_at)}</span>
            </figcaption>
          </figure>
        )}
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-text-secondary">
          {topics.map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: topicOf(t).color }} />
              {topicOf(t).label}
            </li>
          ))}
        </ul>
        <dl className="mt-auto grid grid-cols-3 gap-3 pt-5">
          {[
            [upvotes, upvotes === 1 ? 'upvote' : 'upvotes'],
            [data.points, 'club points'],
            [data.certificates.length, data.certificates.length === 1 ? 'certificate' : 'certificates'],
          ].map(([n, label]) => (
            <div key={label as string} className="flex flex-col-reverse border-t border-[#2A2E37] pt-3">
              <dt className="text-[13px] text-text-tertiary">{label}</dt>
              <dd className="font-mono text-[22px]">{n}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function ProductTile({ product }: { product: DashProduct }) {
  const done = doneCount(product)
  return (
    <Link href={`/dashboard/products/${product.id}/edit`} className="group block text-text-primary">
      {product.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.thumbnail} alt="" className="aspect-[16/10] w-full rounded-[10px] object-cover" />
      ) : (
        <span className="flex aspect-[16/10] w-full items-center justify-center rounded-[10px] bg-paper text-[13px] text-text-disabled">No screenshot yet</span>
      )}
      <span className="mt-3 block truncate font-bold transition-colors group-hover:text-link">{product.title}</span>
      <span className="mt-1.5 flex items-center gap-2.5">
        <Segments done={done} />
        <span className={cn('whitespace-nowrap text-[13px]', done === 4 ? 'text-text-tertiary' : 'text-signal')}>
          {done === 4 ? 'Complete' : `${done} of 4`}
        </span>
      </span>
    </Link>
  )
}

function MostRead({ posts }: { posts: DashPost[] }) {
  const top = [...posts].sort((a, b) => b.view_count - a.view_count).slice(0, 5)
  const max = Math.max(1, top[0]?.view_count || 1)
  return (
    <section aria-labelledby="top" className="min-w-0 flex-[1_1_560px]">
      <SectionHeading id="top" action={{ href: '/dashboard/posts', label: `All ${posts.length} posts` }}>
        Most read
      </SectionHeading>
      <ol className="-mt-2">
        {top.map((p, i) => (
          <li key={p.id} className="border-t border-rule">
            <Link
              href={`/posts/${p.slug}`}
              className="group grid grid-cols-[22px_minmax(0,1fr)_minmax(60px,180px)_40px] items-center gap-3.5 py-[13px] text-text-primary"
            >
              <span className="font-mono text-[13px] text-text-disabled">{i + 1}</span>
              <span className="truncate font-semibold transition-colors group-hover:text-link">{p.title}</span>
              <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-[3px] bg-rule">
                <span className="block h-full" style={{ width: `${Math.round((p.view_count / max) * 100)}%`, background: topicOf(p.category).color }} />
              </span>
              <span className="text-right font-mono text-sm">{p.view_count}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

function CertificateTeaser() {
  const { data } = useDashboard()
  const cert = data.certificates[0]
  if (!cert) return null
  const d = describeCertificate(cert)
  return (
    <section aria-labelledby="cert" className="min-w-0 flex-[0_1_380px]">
      <SectionHeading id="cert" action={data.certificates.length > 1 ? { href: '/dashboard/certificates', label: `All ${data.certificates.length}` } : undefined}>
        Certificate
      </SectionHeading>
      <Link href="/dashboard/certificates" className="group block text-text-primary">
        {cert.file_type === 'image' && cert.file_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cert.file_url} alt={`${d.award} certificate, ${d.program}`} className="aspect-[2000/1414] w-full rounded-[10px] object-cover" />
        ) : (
          <span className="flex aspect-[2000/1414] w-full items-center justify-center rounded-[10px] bg-paper text-sm text-text-tertiary">PDF certificate</span>
        )}
        <span className="mt-3 flex justify-between gap-3">
          <span>
            <span className="block text-[13px] font-semibold" style={{ color: d.tone }}>{d.award}</span>
            <span className="font-bold transition-colors group-hover:text-link">{d.program}</span>
          </span>
          <span className="font-mono text-[13px] text-text-tertiary">{cert.certificate_id}</span>
        </span>
      </Link>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* First weeks: get findable, then pick a way in                       */
/* ------------------------------------------------------------------ */

interface Showcase {
  example: { slug: string; title: string; view_count: number } | null
  products: { id: string; title: string; thumbnail: string | null }[]
  faces: { id: string; full_name: string; avatar_url: string | null }[]
}

function NewcomerOverview({ profile }: { profile: Profile }) {
  const { data } = useDashboard()
  const [show, setShow] = useState<Showcase | null>(null)

  useEffect(() => {
    const supabase: any = createClient()
    Promise.all([
      supabase
        .from('posts')
        .select('slug, title, view_count')
        .eq('status', 'published')
        .eq('category', 'You may want to know')
        .order('view_count', { ascending: false })
        .limit(1),
      supabase
        .from('projects')
        .select('id, title, thumbnail_url, thumbnail_image:images!projects_thumbnail_image_id_fkey(public_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase.from('profiles').select('id, full_name, avatar_url').not('avatar_url', 'is', null).neq('id', profile.id).limit(4),
    ]).then(([ex, pr, fa]: any[]) =>
      setShow({
        example: ex.data?.[0] || null,
        products: (pr.data || [])
          .map((p: any) => ({ id: p.id, title: p.title, thumbnail: p.thumbnail_image?.public_url || p.thumbnail_url }))
          .filter((p: any) => p.thumbnail)
          .slice(0, 3),
        faces: fa.data || [],
      })
    )
  }, [profile.id])

  const links = profile.social_links || {}
  const steps = [
    { title: 'Add a photo', why: 'A face is how people recognise you at meetings.', done: !!profile.avatar_url, action: 'Upload' },
    {
      title: 'Write a one-line bio',
      why: isDefaultBio(profile.bio) && profile.bio ? `Replaces “${profile.bio}”, which says nothing about you.` : 'One line about what you do, shown under your name.',
      done: !isDefaultBio(profile.bio),
      action: 'Write',
    },
    { title: 'Link your GitHub or LinkedIn', why: 'So people who see your work can find more of it.', done: !!(links.github || links.linkedin), action: 'Add' },
  ]
  const n = steps.filter((s) => s.done).length
  const course = COURSES[0]
  const contests = CONTESTS.filter((c) => c.status === 'ended')

  return (
    <div className="flex flex-col gap-14">
      {n < 3 && (
        <section aria-labelledby="setup" className="flex flex-wrap items-stretch gap-6">
          <div className="min-w-0 flex-[1_1_620px] rounded-[14px] bg-paper px-7 py-[26px]">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
              <h2 id="setup" className="text-[22px] font-bold tracking-[-0.01em]">Set up your profile</h2>
              <span className="text-sm text-text-tertiary">{n} of 3 done</span>
            </div>
            <p className="mb-[18px] mt-1 text-[15px] text-text-tertiary">
              Members and visitors look you up on the Members page. Three small things make you recognisable there.
            </p>
            <Segments done={n} total={3} className="mb-2 flex" />
            <ol>
              {steps.map((s, i) => (
                <li key={s.title} className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5', i > 0 && 'border-t border-rule')}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border text-[13px] font-bold',
                      s.done ? 'border-[#3FB57A] bg-[#3FB57A] text-[#0D2A1B]' : 'border-control text-text-secondary'
                    )}
                  >
                    {s.done ? '✓' : i + 1}
                  </span>
                  <span className="min-w-0 flex-[1_1_280px]">
                    <span className={cn('block font-semibold', s.done ? 'text-text-tertiary line-through' : 'text-text-primary')}>{s.title}</span>
                    <span className="block text-sm text-text-tertiary">{s.why}</span>
                  </span>
                  {!s.done && (
                    <Link href="/dashboard/profile" className={btnPrimary}>
                      {s.action}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <aside aria-label="How you appear on the Members page" className="flex min-w-0 flex-[1_1_340px] flex-col gap-2.5">
            <p className="text-sm font-semibold text-text-secondary">On the Members page</p>
            <div className="flex flex-auto flex-col gap-3.5 rounded-[14px] border border-rule p-[22px]">
              <MemberAvatar name={profile.full_name} src={profile.avatar_url} className="h-16 w-16 rounded-xl text-[22px]" />
              <div>
                <p className="text-[19px] font-bold">{profile.full_name}</p>
                <p className={cn('mt-0.5 text-sm', isDefaultBio(profile.bio) ? 'text-text-disabled' : 'text-text-primary')}>
                  {isDefaultBio(profile.bio) ? 'No bio yet' : profile.bio}
                </p>
              </div>
              <Link href={`/members/${profile.id}`} className="mt-auto text-sm font-semibold text-link hover:text-text-primary">
                Open your public profile →
              </Link>
            </div>
          </aside>
        </section>
      )}

      <section aria-labelledby="ways">
        <h2 id="ways" className="text-[22px] font-bold tracking-[-0.01em]">Ways to take part</h2>
        <p className="mb-5 mt-1 text-text-tertiary">Pick one to start. Everything you do here ends up on your profile.</p>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))]">
          {course && (
            <WayCard n="01" kind="Learn" title={`Watch the ${course.shortTitle} course`}>
              <p className="text-[15px] text-text-secondary">
                {course.sessions.length} recorded sessions with slides and notebooks, made for {course.audience.toLowerCase()}.
              </p>
              <ol className="flex flex-col gap-1 text-sm text-text-tertiary">
                {course.sessions.map((s) => (
                  <li key={s.n}>
                    <span className="font-mono text-text-disabled">{s.n} </span> {s.title}
                  </li>
                ))}
              </ol>
              <Link href={`/education/${course.slug}/session/1`} className="mt-auto self-start text-sm font-semibold text-link hover:text-text-primary">
                Start session 1 →
              </Link>
            </WayCard>
          )}

          <WayCard n="02" kind="Compete" title="Try a past contest problem">
            <p className="text-[15px] text-text-secondary">
              No contest is open right now. Past problems stay open for practice on the platform, leaderboard included.
            </p>
            <ul className="flex flex-col gap-2">
              {contests.map((c) => (
                <li key={c.slug}>
                  <a
                    href={c.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-between gap-3 rounded-lg bg-ink px-3 py-2.5 text-sm text-text-primary transition-colors hover:bg-black"
                  >
                    <span>
                      <b>{c.shortName}</b>{' '}
                      <span className="text-text-tertiary">
                        · {c.results.teams ? `${c.results.teams.length} teams` : `${c.results.individuals.length} entrants`}
                      </span>
                    </span>
                    <span className="text-text-tertiary">Practice ↗</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-auto text-[13px] text-text-tertiary">The next contest is announced on the Contests page first.</p>
          </WayCard>

          <WayCard n="03" kind="Write" title="Write a short “Do you know?”">
            <p className="text-[15px] text-text-secondary">
              The easiest first post: one surprising fact from tech history, explained in a few paragraphs.
              {show?.example && ` Like this one, which ${show.example.view_count} people have read:`}
            </p>
            {show?.example && (
              <Link
                href={`/posts/${show.example.slug}`}
                className="block rounded-lg border-l-[3px] border-[#BD8532] bg-ink px-3.5 py-3 text-sm font-semibold text-text-primary hover:text-link"
              >
                {show.example.title}
              </Link>
            )}
            <Link href="/dashboard/posts/new" className="mt-auto self-start text-sm font-semibold text-link hover:text-text-primary">
              Start a draft →
            </Link>
          </WayCard>
        </div>

        <article className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-5 rounded-[14px] bg-paper p-6">
          <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-2.5">
            <p className="font-mono text-[13px] text-text-tertiary">04 · Build</p>
            <h3 className="text-xl font-bold leading-snug">Build something, or join a team that is</h3>
            <p className="text-[15px] text-text-secondary">
              Products are listed with everyone who worked on them and their share. If you helped on one already on the site, ask its creator to
              add you — it then shows on your profile too.
            </p>
            <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <Link href="/dashboard/products/new" className="text-link hover:text-text-primary">Add your own →</Link>
              <Link href="/products" className="text-text-secondary hover:text-text-primary">Browse products</Link>
            </div>
          </div>
          {show && show.products.length > 0 && (
            <ul className="grid min-w-0 flex-[1_1_520px] grid-cols-3 gap-3">
              {show.products.map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.id}`} className="block text-text-secondary hover:text-text-primary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail!} alt="" className="aspect-[16/10] w-full rounded-lg object-cover" />
                    <span className="mt-1.5 block truncate text-[13px]">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <div className="flex flex-wrap items-start gap-x-12 gap-y-10">
        <section aria-labelledby="points" className="min-w-0 flex-[1_1_560px]">
          <h2 id="points" className="text-[22px] font-bold tracking-[-0.01em]">How club points work</h2>
          <p className="mb-4 mt-1 text-text-tertiary">The core team logs activities after they happen. Each one adds points to your profile.</p>
          <dl className="grid gap-x-6 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            {[
              ['Help the club', ['Write a web post', 'Report a website bug', 'Partnership outreach']],
              ['Take part', ['Enter a contest', 'Join a course or workshop', 'Help prepare a workshop']],
              ['Stand out', ['Place in a contest', 'Best result among members']],
            ].map(([title, items]) => (
              <div key={title as string} className="border-t border-rule py-3.5">
                <dt className="mb-1.5 font-semibold">{title}</dt>
                <dd className="flex flex-col gap-0.5 text-sm text-text-tertiary">
                  {(items as string[]).map((it) => (
                    <span key={it}>{it}</span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="people" className="min-w-0 flex-[0_1_380px]">
          <h2 id="people" className="text-[22px] font-bold tracking-[-0.01em]">Who’s here</h2>
          <p className="mb-4 mt-1 text-text-tertiary">
            {data.memberCount} members. The core team can point you to a project that needs hands.
          </p>
          {show && show.faces.length > 0 && (
            <ul className="mb-4 flex">
              {show.faces.map((f, i) => (
                <li key={f.id} className={i ? '-ml-2.5' : ''}>
                  <MemberAvatar name={f.full_name} src={f.avatar_url} className="h-11 w-11 rounded-full border-[3px] border-ink" />
                </li>
              ))}
              {data.memberCount > show.faces.length + 1 && (
                <li className="-ml-2.5">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink bg-rule font-mono text-xs text-text-secondary">
                    +{data.memberCount - show.faces.length - 1}
                  </span>
                </li>
              )}
            </ul>
          )}
          <Link href="/members" className="text-sm font-semibold text-link hover:text-text-primary">
            Meet the members →
          </Link>
        </section>
      </div>
    </div>
  )
}

function WayCard({ n, kind, title, children }: { n: string; kind: string; title: string; children: React.ReactNode }) {
  return (
    <article className="flex flex-col gap-3.5 rounded-[14px] bg-paper p-6">
      <p className="font-mono text-[13px] text-text-tertiary">
        {n} · {kind}
      </p>
      <h3 className="text-xl font-bold leading-snug">{title}</h3>
      {children}
    </article>
  )
}

function OverviewSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your dashboard" className="flex flex-wrap gap-6">
      <div className="h-[320px] flex-[1_1_620px] animate-pulse rounded-[14px] bg-paper" />
      <div className="h-[320px] flex-[1_1_380px] animate-pulse rounded-[14px] bg-paper" />
      <div className="h-[200px] w-full animate-pulse rounded-[14px] bg-paper/60" />
    </div>
  )
}
