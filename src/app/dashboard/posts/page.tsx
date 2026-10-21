'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { btnPrimary } from '@/components/dashboard/ui'
import { DashPost, formatDay, topicOf } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

type Tab = 'published' | 'draft' | 'archived'
const TABS: { id: Tab; label: string }[] = [
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
  { id: 'archived', label: 'Archived' },
]

export default function PostsPage() {
  return (
    <Suspense>
      <PostsList />
    </Suspense>
  )
}

function PostsList() {
  const { data, ready } = useDashboard()
  const params = useSearchParams()
  const initialTab = (TABS.find((t) => t.id === params.get('tab'))?.id || 'published') as Tab
  const [tab, setTab] = useState<Tab>(initialTab)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'new' | 'views'>('new')

  const published = data.posts.filter((p) => p.status === 'published')
  const views = published.reduce((s, p) => s + p.view_count, 0)
  const upvotes = published.reduce((s, p) => s + p.upvote_count, 0)

  const byTopic = useMemo(() => {
    const m = new Map<string, { views: number; posts: number }>()
    for (const p of published) {
      const t = m.get(p.category) || { views: 0, posts: 0 }
      m.set(p.category, { views: t.views + p.view_count, posts: t.posts + 1 })
    }
    return Array.from(m.entries()).sort((a, b) => b[1].views - a[1].views)
  }, [published])

  const dateOf = (p: DashPost) => (tab === 'draft' ? p.updated_at : p.published_at || p.created_at)
  let rows = data.posts.filter((p) => p.status === tab)
  if (q) rows = rows.filter((p) => `${p.title} ${p.title_vi || ''}`.toLowerCase().includes(q.toLowerCase()))
  rows = [...rows].sort((a, b) => (sort === 'views' ? b.view_count - a.view_count : dateOf(b).localeCompare(dateOf(a))))
  const max = Math.max(1, ...rows.map((p) => p.view_count))

  return (
    <>
      <section aria-labelledby="mix" className="mb-10 flex flex-wrap items-end gap-x-12 gap-y-6">
        <div className="shrink-0">
          <h2 id="mix" className="mb-1 text-[28px] font-bold tracking-[-0.02em]">Posts</h2>
          {ready && (
            <p className="text-text-tertiary">
              <span className="font-mono text-text-primary">{views.toLocaleString('en-US')}</span> views ·{' '}
              <span className="font-mono text-text-primary">{upvotes}</span> upvotes
            </p>
          )}
        </div>
        {byTopic.length > 0 && (
          <figure className="min-w-0 flex-[1_1_480px]">
            <figcaption className="mb-2 text-[13px] text-text-tertiary">Views by topic</figcaption>
            <div
              role="img"
              aria-label={byTopic.map(([c, v]) => `${topicOf(c).label} ${v.views} views`).join(', ')}
              className="flex h-3.5 gap-[3px] overflow-hidden rounded-[3px]"
            >
              {byTopic.map(([c, v]) => (
                <span key={c} style={{ flex: `${Math.max(v.views, 1)} 1 0`, background: topicOf(c).color }} />
              ))}
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-secondary">
              {byTopic.map(([c, v]) => (
                <li key={c} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: topicOf(c).color }} />
                  {topicOf(c).label} <span className="font-mono text-text-primary">{v.views}</span>
                  <span className="text-text-disabled">· {v.posts} post{v.posts > 1 ? 's' : ''}</span>
                </li>
              ))}
            </ul>
          </figure>
        )}
      </section>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-rule">
        <div role="tablist" aria-label="Status" className="flex gap-6 text-[15px] font-medium">
          {TABS.map((t) => {
            const on = t.id === tab
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t.id)}
                className={cn('-mb-px border-b-2 pb-3 pt-2.5', on ? 'border-link text-white' : 'border-transparent text-text-secondary hover:text-text-primary')}
              >
                {t.label} <span className="font-mono text-[13px] text-text-tertiary">{data.posts.filter((p) => p.status === t.id).length}</span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2 pb-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your posts"
            aria-label="Search your posts"
            className="min-h-[38px] w-[220px] max-w-full rounded-md border border-control bg-paper px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-link focus:outline-none"
          />
          {tab === 'published' && (
            <button
              type="button"
              onClick={() => setSort(sort === 'new' ? 'views' : 'new')}
              className="min-h-[38px] rounded-md border border-control px-3 text-sm text-text-secondary hover:text-text-primary"
            >
              Sort: {sort === 'new' ? 'Newest' : 'Most viewed'}
            </button>
          )}
        </div>
      </div>

      {!ready ? (
        <div aria-busy="true" className="mt-4 flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-paper" />
          ))}
        </div>
      ) : rows.length ? (
        <div role="table" aria-label="Your posts">
          <div role="row" className="hidden gap-4 py-2.5 text-[13px] text-text-disabled md:grid md:grid-cols-[104px_minmax(0,1fr)_160px_64px_120px]">
            <span role="columnheader">{tab === 'draft' ? 'Last edited' : 'Published'}</span>
            <span role="columnheader">Title</span>
            <span role="columnheader">Views</span>
            <span role="columnheader" className="text-right">Upvotes</span>
            <span role="columnheader"><span className="sr-only">Actions</span></span>
          </div>
          {rows.map((p) => {
            const topic = topicOf(p.category)
            const untitled = !p.title.trim() || /^untitled post$/i.test(p.title.trim())
            return (
              <div
                key={p.id}
                role="row"
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-t border-rule py-3 md:grid-cols-[104px_minmax(0,1fr)_160px_64px_120px]"
              >
                <span role="cell" className="col-span-2 font-mono text-[13px] text-text-tertiary md:col-span-1">{formatDay(dateOf(p))}</span>
                <span role="cell" className="min-w-0">
                  <Link href={`/dashboard/posts/${p.id}/edit`} className={cn('block truncate font-semibold hover:text-link', untitled ? 'italic text-text-tertiary' : 'text-text-primary')}>
                    {untitled ? 'Untitled draft' : p.title}
                  </Link>
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-text-tertiary">
                    <span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ background: topic.color }} />
                    {topic.label}
                  </span>
                </span>
                <span role="cell" className="hidden items-center gap-2.5 md:flex">
                  {p.status === 'published' ? (
                    <>
                      <span aria-hidden="true" className="h-1.5 flex-auto overflow-hidden rounded-[3px] bg-rule">
                        <span className="block h-full" style={{ width: `${Math.round((p.view_count / max) * 100)}%`, background: topic.color }} />
                      </span>
                      <span className="w-8 text-right font-mono text-sm">{p.view_count}</span>
                    </>
                  ) : (
                    <span className="text-sm text-text-disabled">—</span>
                  )}
                </span>
                <span role="cell" className={cn('hidden text-right font-mono text-sm md:block', p.upvote_count ? 'text-text-primary' : 'text-text-disabled')}>
                  {p.upvote_count}
                </span>
                <span role="cell" className="row-start-2 flex justify-end gap-1 md:row-start-auto">
                  {p.status === 'published' && (
                    <Link href={`/posts/${p.slug}`} className="px-2 py-1.5 text-sm font-semibold text-text-secondary hover:text-text-primary">
                      View
                    </Link>
                  )}
                  <Link href={`/dashboard/posts/${p.id}/edit`} className="rounded-md border border-control px-2.5 py-1.5 text-sm font-semibold text-text-primary hover:border-text-tertiary">
                    Edit
                  </Link>
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="max-w-[520px] py-14">
          <h3 className="mb-1.5 text-xl font-bold">
            {q ? `No posts match “${q}”` : tab === 'draft' ? 'No drafts' : tab === 'archived' ? 'Nothing archived' : 'Nothing published yet'}
          </h3>
          <p className="mb-5 text-text-tertiary">
            {q
              ? 'Try a word from the title.'
              : tab === 'draft'
                ? 'A post you start shows up here once you save it, until you publish.'
                : tab === 'archived'
                  ? 'Archived posts are hidden from the site but kept here. You can restore them any time.'
                  : 'Your first post can be short — one surprising fact, explained well.'}
          </p>
          {!q && tab !== 'archived' && (
            <Link href="/dashboard/posts/new" className={btnPrimary}>
              Write a post
            </Link>
          )}
        </div>
      )}
    </>
  )
}
