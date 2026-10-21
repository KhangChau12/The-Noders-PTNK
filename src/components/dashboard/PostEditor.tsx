'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { BlockEditor, missingVi, type Lang } from '@/components/posts/BlockEditor'
import { POST_CATEGORIES } from '@/lib/constants'
import { postQueries } from '@/lib/queries'
import { uploadImage } from '@/lib/upload'
import { calculateReadingTime, cn } from '@/lib/utils'
import { formatDay, topicOf } from '@/lib/dashboard'
import type { Post, PostBlock } from '@/types/database'
import { useDashboard } from './DashboardContext'
import { EditorFrame } from './ProductEditor'
import { btnPrimary, btnSecondary, fieldClass, hintClass } from './ui'

interface Info {
  title: string
  summary: string
  title_vi: string
  summary_vi: string
  category: string
  thumbnail_image_id: string | null
  date: string // yyyy-mm-dd shown on the post
}

const TITLE_MAX = 100
const SUMMARY_MAX = 500

const infoFrom = (p: Post): Info => ({
  title: p.title && p.title !== 'Untitled Post' ? p.title : '',
  summary: p.summary || '',
  title_vi: p.title_vi && p.title_vi !== 'Untitled Post' ? p.title_vi : '',
  summary_vi: p.summary_vi || '',
  category: p.category || 'News',
  thumbnail_image_id: p.thumbnail_image_id || null,
  date: (p.published_at || p.created_at || '').slice(0, 10),
})

/**
 * One editor for new and existing posts. A new post has no database row until
 * it has a title — then it's created as a draft and the URL switches to /edit,
 * so abandoned "Write a post" clicks no longer leave empty drafts behind.
 */
export function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter()
  const { session, user, isAdmin } = useAuth()
  const { refresh } = useDashboard()
  const { showToast } = useToast()
  const { confirm } = useConfirm()

  const [post, setPost] = useState<Post | null>(null)
  const [blocks, setBlocks] = useState<PostBlock[]>([])
  const blank: Info = { title: '', summary: '', title_vi: '', summary_vi: '', category: 'News', thumbnail_image_id: null, date: '' }
  const [info, setInfo] = useState<Info | null>(postId ? null : blank)
  const [cover, setCover] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [busy, setBusy] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const [uploading, setUploading] = useState(false)
  const lastSaved = useRef<string>(postId ? '' : JSON.stringify(blank))
  const creating = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Load an existing post
  useEffect(() => {
    if (!postId || !session?.access_token) return
    postQueries.getPost(postId, session).then(({ post: p, blocks: b, error }: any) => {
      if (error || !p) {
        showToast('error', 'This post doesn’t exist or you can’t edit it.')
        router.replace('/dashboard/posts')
        return
      }
      if (user && !isAdmin && p.author_id !== user.id) {
        showToast('error', 'You can only edit your own posts.')
        router.replace('/dashboard/posts')
        return
      }
      const i = infoFrom(p)
      lastSaved.current = JSON.stringify(i)
      setPost(p)
      setBlocks(b || [])
      setInfo(i)
      setCover(p.thumbnail_image?.public_url || p.thumbnail_url || null)
    })
  }, [postId, session?.access_token]) // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback(
    async (i: Info) => {
      const snapshot = JSON.stringify(i)
      if (snapshot === lastSaved.current) return
      if (i.title.length > TITLE_MAX || i.summary.length > SUMMARY_MAX || i.title_vi.length > TITLE_MAX || i.summary_vi.length > SUMMARY_MAX) {
        setSaveState('error')
        return
      }

      // First save of a new post: create the row, then hand over to /edit
      if (!postId) {
        if (i.title.trim().length < 3 || creating.current) return
        creating.current = true
        setSaveState('saving')
        const { post: created, error } = await postQueries.createPost(
          { title: i.title.trim(), summary: i.summary.slice(0, 300), category: i.category, thumbnail_image_id: i.thumbnail_image_id || undefined },
          session
        )
        if (error || !created) {
          creating.current = false
          setSaveState('error')
          showToast('error', error?.message || 'Couldn’t create the draft')
          return
        }
        if (i.title_vi || i.summary_vi || i.summary.length > 300) {
          await postQueries.updatePost(created.id, { title_vi: i.title_vi, summary_vi: i.summary_vi, summary: i.summary }, session)
        }
        refresh()
        router.replace(`/dashboard/posts/${created.id}/edit`)
        return
      }

      setSaveState('saving')
      const payload: any = {
        title: i.title.trim() || 'Untitled Post',
        summary: i.summary,
        title_vi: i.title_vi,
        summary_vi: i.summary_vi,
        category: i.category,
        thumbnail_image_id: i.thumbnail_image_id,
      }
      if (post && i.date && i.date !== (post.published_at || post.created_at || '').slice(0, 10)) {
        const iso = `${i.date}T12:00:00.000Z`
        payload.created_at = iso
        if (post.status === 'published') payload.published_at = iso
      }
      const { post: updated, error } = await postQueries.updatePost(postId, payload, session)
      if (error) {
        setSaveState('error')
        showToast('error', error.message)
        return
      }
      lastSaved.current = snapshot
      if (updated) setPost((p) => (p ? { ...p, ...updated } : updated))
      setSavedAt(new Date())
      setSaveState('saved')
    },
    [postId, post, session, refresh, router, showToast]
  )

  // Autosave 1.2 s after typing stops
  useEffect(() => {
    if (!info) return
    if (JSON.stringify(info) === lastSaved.current) return
    setSaveState('dirty')
    const t = setTimeout(() => persist(info), 1200)
    return () => clearTimeout(t)
  }, [info, persist])

  // Save before leaving
  useEffect(() => {
    if (saveState !== 'dirty' && saveState !== 'saving') return
    const h = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [saveState])

  if (!info) {
    return (
      <EditorFrame title="Loading…" status={null} back={{ href: '/dashboard/posts', label: 'Posts' }}>
        <div aria-busy="true" className="h-[600px] animate-pulse rounded-[14px] bg-paper" />
      </EditorFrame>
    )
  }

  const set = <K extends keyof Info>(k: K, v: Info[K]) => setInfo((s) => (s ? { ...s, [k]: v } : s))
  const status = post?.status || 'draft'
  const readingTime = calculateReadingTime(blocks)
  const viMissing = blocks.filter(missingVi).length

  const statusText =
    saveState === 'saving'
      ? { text: 'Saving…', tone: 'text-signal' }
      : saveState === 'dirty'
        ? { text: 'Editing…', tone: 'text-text-tertiary' }
        : saveState === 'error'
          ? { text: 'Not saved — check the highlighted fields', tone: 'text-[#FF9C85]' }
          : !postId
            ? { text: 'Saved as a draft once it has a title', tone: 'text-text-tertiary' }
            : savedAt
              ? { text: `Saved ${savedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}${status === 'published' ? ' · live on the site' : ''}`, tone: 'text-text-tertiary' }
              : { text: status === 'published' ? 'Published · edits go live as they save' : 'Draft · saves as you type', tone: 'text-text-tertiary' }

  const flushThen = async (fn: () => Promise<void>) => {
    await persist(info)
    await fn()
  }

  const setStatus = async (next: 'draft' | 'published' | 'archived') => {
    if (!postId || !post) return
    if (next === 'published') {
      const missing = [!info.title.trim() && 'a title', !info.summary.trim() && 'a summary'].filter(Boolean)
      if (missing.length) return showToast('warning', `Add ${missing.join(' and ')} before publishing.`)
      if (!blocks.length) {
        const ok = await confirm({ title: 'Publish without content?', message: 'This post has no content blocks yet.', confirmText: 'Publish anyway', cancelText: 'Keep editing', variant: 'warning' })
        if (!ok) return
      }
    }
    if (next === 'archived') {
      const ok = await confirm({ title: 'Archive this post?', message: 'It disappears from the site but stays in your dashboard. You can restore it any time.', confirmText: 'Archive', cancelText: 'Cancel', variant: 'warning' })
      if (!ok) return
    }
    setBusy(true)
    await flushThen(async () => {
      const { post: updated, error } = await postQueries.updatePost(postId, { status: next, reading_time: readingTime }, session)
      if (error) showToast('error', error.message)
      else {
        setPost((p) => (p ? { ...p, ...updated } : updated))
        showToast('success', next === 'published' ? 'Published' : next === 'archived' ? 'Archived' : 'Moved to drafts')
        refresh()
      }
    })
    setBusy(false)
  }

  const remove = async () => {
    if (!postId) return
    const ok = await confirm({ title: 'Delete this post?', message: 'The post and all its blocks are removed for good.', confirmText: 'Delete post', cancelText: 'Keep it', variant: 'danger' })
    if (!ok) return
    const { error } = await postQueries.deletePost(postId, session)
    if (error) return showToast('error', error.message)
    await refresh()
    router.push('/dashboard/posts')
  }

  const onCover = async (file?: File) => {
    if (!file || !session?.access_token) return
    try {
      setUploading(true)
      const img = await uploadImage(file, 'news_image', session.access_token)
      setCover(img.public_url)
      set('thumbnail_image_id', img.id)
    } catch (e: any) {
      showToast('error', e.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const counter = (n: number, max: number) => (
    <span className={cn('font-mono text-[12px]', n > max ? 'text-[#FF9C85]' : 'text-text-disabled')}>
      {n}/{max}
    </span>
  )

  return (
    <EditorFrame
      title={info.title || (postId ? 'Untitled draft' : 'New post')}
      status={statusText}
      back={{ href: '/dashboard/posts', label: 'Posts' }}
      actions={
        <>
          {postId && (
            <div role="group" aria-label="Language you’re editing" className="inline-flex gap-0.5 rounded-lg bg-paper p-[3px]">
              {(['en', 'vi'] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={lang === l}
                  onClick={() => setLang(l)}
                  className={cn('min-h-[32px] rounded-md px-3 text-[13px] font-semibold', lang === l ? 'bg-navy text-white' : 'text-text-secondary hover:text-text-primary')}
                >
                  {l.toUpperCase()}
                  {l === 'vi' && viMissing > 0 && <span className="ml-1 text-signal">•</span>}
                </button>
              ))}
            </div>
          )}
          {post && status === 'published' && (
            <Link href={`/posts/${post.slug}`} target="_blank" className="hidden px-2.5 py-2 sm:inline text-sm font-semibold text-text-secondary hover:text-text-primary">
              View live ↗
            </Link>
          )}
          {postId && status !== 'published' && (
            <button type="button" onClick={() => setStatus('published')} disabled={busy} className={btnPrimary}>
              Publish
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-wrap items-start gap-x-14 gap-y-10">
        <article className="min-w-0 max-w-[760px] flex-[1_1_640px]">
          {post && (
            <p className="mb-2 text-sm text-text-tertiary">
              {[topicOf(info.category).label, status === 'published' ? `Published ${formatDay(post.published_at)}` : status === 'archived' ? 'Archived' : 'Draft', status === 'published' ? `${post.view_count} views` : null, `${readingTime} min read`]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          <label htmlFor="title" className="sr-only">Title</label>
          <textarea
            id="title"
            rows={2}
            autoFocus={!postId}
            value={info.title}
            onChange={(e) => set('title', e.target.value.replace(/\n/g, ' '))}
            placeholder="Title"
            className="w-full resize-none overflow-hidden bg-transparent [field-sizing:content] text-[clamp(30px,3.2vw,40px)] font-bold leading-[1.15] tracking-[-0.025em] text-text-primary placeholder:text-text-disabled focus:outline-none"
          />
          <div className="flex justify-end">{counter(info.title.length, TITLE_MAX)}</div>
          <label htmlFor="summary" className="sr-only">Summary</label>
          <textarea
            id="summary"
            rows={3}
            value={info.summary}
            onChange={(e) => set('summary', e.target.value)}
            placeholder="A two- or three-sentence summary. It's shown under the title and on post cards."
            className="mt-2 w-full resize-none overflow-hidden bg-transparent [field-sizing:content] text-[19px] leading-normal text-text-secondary placeholder:text-text-disabled focus:outline-none"
          />
          <div className="flex justify-end">{counter(info.summary.length, SUMMARY_MAX)}</div>

          <div className="mb-2 mt-6 h-px bg-rule" />

          {postId ? (
            <div className="post-blocks">
              <p className="mb-3 text-sm text-text-tertiary">
                {lang === 'en'
                  ? viMissing
                    ? `Editing in English. ${viMissing} block${viMissing > 1 ? 's' : ''} still need${viMissing > 1 ? '' : 's'} Vietnamese.`
                    : 'Editing in English.'
                  : 'Editing in Vietnamese. Each block shows the English next to it so you can translate in place.'}
              </p>
              <BlockEditor blocks={blocks} postId={postId} session={session} lang={lang} onBlocksChange={(b) => b && setBlocks(b)} />
            </div>
          ) : (
            <div className="rounded-[14px] border border-dashed border-control px-6 py-10 text-center">
              <p className="font-semibold">Content comes next</p>
              <p className="mt-1 text-sm text-text-tertiary">Type a title above. The draft is saved automatically and the block editor opens here.</p>
            </div>
          )}
        </article>

        <aside className="flex min-w-0 flex-[0_1_320px] flex-col gap-6 lg:sticky lg:top-[150px]">
          <section>
            <h2 className="mb-2.5 text-sm font-semibold text-text-secondary">Topic</h2>
            <div role="radiogroup" aria-label="Topic" className="flex flex-wrap gap-1.5">
              {POST_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={info.category === c}
                  onClick={() => set('category', c)}
                  className={cn(
                    'min-h-[34px] rounded-md border px-3 text-sm',
                    info.category === c ? 'border-[#4A6BA8] bg-navy text-white' : 'border-control text-text-secondary hover:text-text-primary'
                  )}
                >
                  {topicOf(c).label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2.5 text-sm font-semibold text-text-secondary">Cover</h2>
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="aspect-video w-full rounded-lg object-cover" />
            ) : (
              <span className="flex aspect-video w-full items-center justify-center rounded-lg bg-paper px-4 text-center text-[13px] text-text-tertiary">
                No cover — cards use the first image in the post
              </span>
            )}
            <div className="mt-2 flex gap-3 text-sm font-semibold">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-link hover:text-text-primary">
                {uploading ? 'Uploading…' : cover ? 'Replace' : 'Upload a cover'}
              </button>
              {cover && (
                <button type="button" onClick={() => { setCover(null); set('thumbnail_image_id', null) }} className="text-text-tertiary hover:text-text-primary">
                  Remove
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => onCover(e.target.files?.[0])} />
          </section>

          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-text-secondary">Vietnamese version</h2>
              <span className={cn('text-[13px]', info.title_vi && info.summary_vi ? 'text-[#6FD39F]' : 'text-signal')}>
                {info.title_vi && info.summary_vi ? '✓' : 'Not added'}
              </span>
            </div>
            <input value={info.title_vi} onChange={(e) => set('title_vi', e.target.value)} placeholder="Tiêu đề tiếng Việt" aria-label="Vietnamese title" className={cn(fieldClass, 'mb-1.5 min-h-[40px] text-sm')} />
            <textarea value={info.summary_vi} onChange={(e) => set('summary_vi', e.target.value)} rows={3} placeholder="Tóm tắt" aria-label="Vietnamese summary" className={cn(fieldClass, 'resize-y py-2.5 text-sm')} />
            <p className={hintClass}>Shown when a reader switches the site to Vietnamese.</p>
            {blocks.some((b) => b.type === 'text' || b.type === 'quote') && (
              <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {blocks.map((b, i) =>
                  b.type === 'text' || b.type === 'quote' ? (
                    <li key={b.id} className="flex justify-between">
                      <span className="text-text-secondary">Block {i + 1} · {b.type}</span>
                      {missingVi(b) ? (
                        <button type="button" onClick={() => setLang('vi')} className="text-signal hover:text-text-primary">missing</button>
                      ) : (
                        <span className="text-[#6FD39F]">✓</span>
                      )}
                    </li>
                  ) : null
                )}
              </ul>
            )}
          </section>

          {post && (
            <section>
              <label htmlFor="date" className="mb-2.5 block text-sm font-semibold text-text-secondary">Date shown on the post</label>
              <input id="date" type="date" value={info.date} onChange={(e) => set('date', e.target.value)} className={cn(fieldClass, 'min-h-[40px] text-sm [color-scheme:dark]')} />
              <p className="mt-3 break-all font-mono text-xs text-text-tertiary">/posts/{post.slug}</p>
            </section>
          )}

          {post && (
            <section className="flex flex-wrap gap-x-4 gap-y-2 border-t border-rule pt-[18px] text-sm font-semibold">
              {status === 'published' && (
                <button type="button" onClick={() => setStatus('draft')} disabled={busy} className="text-text-secondary hover:text-text-primary">
                  Move to drafts
                </button>
              )}
              {status === 'archived' ? (
                <button type="button" onClick={() => setStatus('draft')} disabled={busy} className="text-text-secondary hover:text-text-primary">
                  Restore as draft
                </button>
              ) : (
                <button type="button" onClick={() => setStatus('archived')} disabled={busy} className="text-text-secondary hover:text-text-primary">
                  Archive
                </button>
              )}
              <button type="button" onClick={remove} className="text-[#FF9C85] hover:text-[#FFC9B8]">
                Delete…
              </button>
            </section>
          )}

          {post && status === 'published' && post.reading_time !== readingTime && (
            <button type="button" onClick={() => setStatus('published')} disabled={busy} className={cn(btnSecondary, 'self-start')}>
              Update reading time ({readingTime} min)
            </button>
          )}
        </aside>
      </div>
    </EditorFrame>
  )
}
