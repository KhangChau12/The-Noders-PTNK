'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { RichText, countWords, plainText } from '@/components/RichText'
import { youtubeId } from '@/components/editorial'
import { uploadImage } from '@/lib/upload'
import { cn } from '@/lib/utils'
import type { PostBlock } from '@/types/database'

export type Lang = 'en' | 'vi'
type BlockType = 'text' | 'quote' | 'image' | 'youtube'

const MAX_BLOCKS = 15
const MAX_IMAGES = 5

interface BlockEditorProps {
  blocks: PostBlock[]
  postId: string
  onBlocksChange: (blocks?: PostBlock[]) => void
  session: any
  /** Which language the text and quote blocks are edited in. */
  lang?: Lang
}

/* ---------- content helpers ---------- */

const textOf = (c: any, lang: Lang) => (lang === 'vi' ? c?.html_vi || '' : c?.html || '')
const quoteOf = (c: any, lang: Lang) => (lang === 'vi' ? c?.quote_vi || '' : c?.quote_en || c?.quote || '')

/** Does this block still need its Vietnamese version? */
export function missingVi(b: Pick<PostBlock, 'type' | 'content'>) {
  const c = b.content as any
  if (b.type === 'text') return !!plainText(c?.html || '') && !plainText(c?.html_vi || '')
  if (b.type === 'quote') return !!(c?.quote_en || c?.quote) && !c?.quote_vi
  return false
}

function textContent(prev: any, lang: Lang, html: string) {
  const next = { ...prev, [lang === 'vi' ? 'html_vi' : 'html']: html }
  const en = next.html || ''
  const vi = next.html_vi || ''
  // The server reads `html` + `word_count`; fall back to the Vietnamese text when English is empty
  return { html: en || vi, html_vi: vi, word_count: countWords(en || vi), word_count_vi: countWords(vi) }
}

function quoteContent(prev: any, lang: Lang, text: string, author?: string) {
  const next = { ...prev, [lang === 'vi' ? 'quote_vi' : 'quote_en']: text }
  if (author !== undefined) next.author = author || undefined
  next.quote = next.quote_en || next.quote_vi || ''
  return next
}

const looksLikeFileName = (s?: string) => !!s && /\.(png|jpe?g|webp|gif)$/i.test(s.trim())

/* ---------- editor ---------- */

export function BlockEditor({ blocks, postId, onBlocksChange, session, lang = 'en' }: BlockEditorProps) {
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [draft, setDraft] = useState<BlockType | null>(null)
  const [saving, setSaving] = useState<Record<string, 'saving' | 'saved' | 'error'>>({})
  const [moving, setMoving] = useState(false)
  const blocksRef = useRef(blocks)
  const adding = useRef(false)
  blocksRef.current = blocks

  const auth = { Authorization: `Bearer ${session?.access_token}` }
  const images = blocks.filter((b) => b.type === 'image').length
  const last = blocks[blocks.length - 1]
  const full = blocks.length >= MAX_BLOCKS
  const mark = (id: string, s: 'saving' | 'saved' | 'error') => setSaving((x) => ({ ...x, [id]: s }))

  const add = async (type: BlockType, content: any) => {
    if (adding.current) return false
    adding.current = true
    try {
    const res = await fetch(`/api/posts/${postId}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ type, content, order_index: blocksRef.current.length }),
    })
    const json = await res.json().catch(() => ({}))
    if (!json.success) {
      showToast('error', json.error || 'Couldn’t add the block')
      return false
    }
    onBlocksChange([...blocksRef.current, json.block])
    setDraft(null)
    mark(json.block.id, 'saved')
    return true
    } finally {
      adding.current = false
    }
  }

  const update = async (id: string, content: any) => {
    const before = blocksRef.current
    onBlocksChange(before.map((b) => (b.id === id ? { ...b, content } : b)))
    mark(id, 'saving')
    try {
      const res = await fetch(`/api/posts/${postId}/blocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ content }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      mark(id, 'saved')
    } catch (e: any) {
      mark(id, 'error')
      showToast('error', `Couldn’t save that block${e?.message ? ` — ${e.message}` : ''}. Your text is still here; edit again to retry.`)
    }
  }

  const move = async (id: string, direction: 'up' | 'down') => {
    if (moving) return
    const before = blocksRef.current
    const i = before.findIndex((b) => b.id === id)
    const j = direction === 'up' ? i - 1 : i + 1
    if (i < 0 || j < 0 || j >= before.length) return
    const next = [...before]
    ;[next[i], next[j]] = [next[j], next[i]]
    onBlocksChange(next)
    setMoving(true)
    try {
      const res = await fetch(`/api/posts/${postId}/blocks/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ blockId: id, direction }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      if (json.blocks) onBlocksChange(json.blocks)
    } catch (e: any) {
      onBlocksChange(before)
      showToast('error', e?.message || 'Couldn’t move the block')
    } finally {
      setMoving(false)
    }
  }

  const remove = async (b: PostBlock) => {
    const ok = await confirm({
      title: `Delete this ${b.type === 'youtube' ? 'video' : b.type} block?`,
      message: b.type === 'text' ? 'Both the English and Vietnamese text in it are removed.' : 'It’s removed from the post for good.',
      confirmText: 'Delete block',
      cancelText: 'Keep',
      variant: 'danger',
    })
    if (!ok) return
    const before = blocksRef.current
    onBlocksChange(before.filter((x) => x.id !== b.id))
    const res = await fetch(`/api/posts/${postId}/blocks/${b.id}`, { method: 'DELETE', headers: auth })
    const json = await res.json().catch(() => ({}))
    if (!json.success) {
      onBlocksChange(before)
      showToast('error', json.error || 'Couldn’t delete the block')
    }
  }

  const choices: { type: BlockType; label: string; disabled?: string }[] = [
    { type: 'text', label: 'Text', disabled: last?.type === 'text' ? 'Two text blocks can’t sit next to each other — add to the one above' : undefined },
    { type: 'image', label: 'Image', disabled: images >= MAX_IMAGES ? `At most ${MAX_IMAGES} images per post` : undefined },
    { type: 'quote', label: 'Quote' },
    { type: 'youtube', label: 'YouTube' },
  ]

  return (
    <div>
      {blocks.length === 0 && !draft && (
        <p className="py-6 text-text-tertiary">No content yet. Start with a text block — headings you add become sections in the post.</p>
      )}

      {blocks.map((b, i) => (
        <BlockFrame
          key={b.id}
          status={saving[b.id]}
          canUp={i > 0 && !moving}
          canDown={i < blocks.length - 1 && !moving}
          onUp={() => move(b.id, 'up')}
          onDown={() => move(b.id, 'down')}
          onDelete={() => remove(b)}
        >
          <BlockBody block={b} lang={lang} session={session} onSave={(c) => update(b.id, c)} />
        </BlockFrame>
      ))}

      {draft && (
        <BlockFrame onDelete={() => setDraft(null)} deleteLabel="Cancel" status={undefined}>
          <BlockBody block={{ id: 'draft', type: draft, content: {} } as any} lang={lang} session={session} onSave={(c) => add(draft, c)} isDraft />
        </BlockFrame>
      )}

      {!draft && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4">
          {full ? (
            <span className="text-sm text-signal">This post has the maximum of {MAX_BLOCKS} blocks.</span>
          ) : (
            <span className="inline-flex flex-wrap gap-0.5 rounded-full border border-dashed border-control p-0.5 text-[13px]">
              {choices.map((c) => (
                <button
                  key={c.type}
                  type="button"
                  disabled={!!c.disabled}
                  title={c.disabled}
                  onClick={() => setDraft(c.type)}
                  className="rounded-full px-3 py-1.5 text-text-secondary hover:bg-white/[0.06] hover:text-text-primary disabled:text-text-disabled disabled:hover:bg-transparent"
                >
                  + {c.label}
                </button>
              ))}
            </span>
          )}
        </div>
      )}
      <p className="mt-4 border-t border-rule pt-4 text-[13px] text-text-disabled">
        {blocks.length} of {MAX_BLOCKS} blocks · {images} of {MAX_IMAGES} images · each block saves on its own a moment after you stop typing
      </p>
    </div>
  )
}

function BlockFrame({
  children, status, canUp, canDown, onUp, onDown, onDelete, deleteLabel = 'Delete',
}: {
  children: React.ReactNode
  status?: 'saving' | 'saved' | 'error'
  canUp?: boolean
  canDown?: boolean
  onUp?: () => void
  onDown?: () => void
  onDelete: () => void
  deleteLabel?: string
}) {
  return (
    <div className="group relative -mx-3 rounded-[10px] px-3 py-3.5 transition-colors focus-within:bg-[#12151B] focus-within:shadow-[inset_0_0_0_1px_#2A2E37] hover:bg-[#101318] sm:-mx-5 sm:px-5">
      {onUp && (
        <div className="absolute -left-9 top-3.5 hidden flex-col gap-0.5 opacity-40 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 lg:flex">
          <button type="button" onClick={onUp} disabled={!canUp} aria-label="Move block up" className="h-[26px] w-7 text-text-tertiary hover:text-text-primary disabled:opacity-30">↑</button>
          <button type="button" onClick={onDown} disabled={!canDown} aria-label="Move block down" className="h-[26px] w-7 text-text-tertiary hover:text-text-primary disabled:opacity-30">↓</button>
        </div>
      )}
      {children}
      <div className="mt-2 flex items-center justify-end gap-3 text-xs opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        {status && (
          <span className={cn(status === 'error' ? 'text-[#FF9C85]' : status === 'saving' ? 'text-signal' : 'text-text-disabled')}>
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Not saved'}
          </span>
        )}
        {onUp && (
          <span className="flex gap-1 lg:hidden">
            <button type="button" onClick={onUp} disabled={!canUp} aria-label="Move block up" className="h-8 w-8 rounded text-text-tertiary disabled:opacity-30">↑</button>
            <button type="button" onClick={onDown} disabled={!canDown} aria-label="Move block down" className="h-8 w-8 rounded text-text-tertiary disabled:opacity-30">↓</button>
          </span>
        )}
        <button type="button" onClick={onDelete} className="font-semibold text-text-tertiary hover:text-[#FF9C85]">{deleteLabel}</button>
      </div>
    </div>
  )
}

/** Saves `fn` 1.2 s after the last change. */
function useDebounced(fn: () => void, deps: unknown[], enabled: boolean) {
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!enabled) return
    const t = setTimeout(fn, 1200)
    return () => clearTimeout(t)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

function BlockBody({ block, lang, session, onSave, isDraft }: { block: PostBlock; lang: Lang; session: any; onSave: (c: any) => void; isDraft?: boolean }) {
  switch (block.type) {
    case 'text':
      return <TextBlock content={block.content} lang={lang} onSave={onSave} />
    case 'quote':
      return <QuoteBlock content={block.content} lang={lang} onSave={onSave} />
    case 'image':
      return <ImageBlock content={block.content} image={(block as any).image} session={session} onSave={onSave} isDraft={isDraft} />
    case 'youtube':
      return <YouTubeBlock content={block.content} onSave={onSave} />
    default:
      return null
  }
}

function TextBlock({ content, lang, onSave }: { content: any; lang: Lang; onSave: (c: any) => void }) {
  const [html, setHtml] = useState(textOf(content, lang))
  useEffect(() => setHtml(textOf(content, lang)), [lang]) // eslint-disable-line react-hooks/exhaustive-deps
  const words = countWords(html)
  useDebounced(() => words > 0 && html !== textOf(content, lang) && onSave(textContent(content, lang, html)), [html], true)
  const reference = lang === 'vi' ? plainText(content?.html || '') : ''

  return (
    <>
      <RichText
        value={html}
        onChange={setHtml}
        label={`Text block, ${lang === 'vi' ? 'Vietnamese' : 'English'}`}
        toolbar="focus"
        placeholder={lang === 'vi' ? 'Viết bằng tiếng Việt…' : 'Write here. Use H2 for section headings.'}
        extra={<span className="text-xs text-text-disabled">{words} {lang === 'vi' ? 'từ' : 'words'}</span>}
      />
      {reference && (
        <p className="mt-2 border-l-2 border-control pl-3 text-sm text-text-tertiary">
          <span className="font-semibold text-text-secondary">English: </span>
          {reference.length > 280 ? reference.slice(0, 280) + '…' : reference}
        </p>
      )}
    </>
  )
}

function QuoteBlock({ content, lang, onSave }: { content: any; lang: Lang; onSave: (c: any) => void }) {
  const [text, setText] = useState(quoteOf(content, lang))
  const [author, setAuthor] = useState(content?.author || '')
  useEffect(() => setText(quoteOf(content, lang)), [lang]) // eslint-disable-line react-hooks/exhaustive-deps
  useDebounced(() => text.trim() && onSave(quoteContent(content, lang, text.trim(), author.trim())), [text, author], true)
  const reference = lang === 'vi' ? content?.quote_en || content?.quote : ''

  return (
    <blockquote className="border-l-[3px] border-[#5B7FD6] pl-[22px]">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 500))}
        rows={2}
        aria-label={`Quote, ${lang === 'vi' ? 'Vietnamese' : 'English'}`}
        placeholder={lang === 'vi' ? 'Trích dẫn…' : 'The quote'}
        className="w-full resize-none bg-transparent text-[22px] font-semibold leading-snug text-text-primary placeholder:text-text-disabled focus:outline-none [field-sizing:content]"
      />
      {reference && <p className="mb-1 text-sm text-text-tertiary">English: “{reference}”</p>}
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value.slice(0, 100))}
        aria-label="Who said it"
        placeholder="Who said it (optional)"
        className="w-full bg-transparent text-sm text-text-tertiary placeholder:text-text-disabled focus:outline-none"
      />
    </blockquote>
  )
}

function ImageBlock({ content, image, session, onSave, isDraft }: { content: any; image?: { public_url?: string }; session: any; onSave: (c: any) => void; isDraft?: boolean }) {
  const { showToast } = useToast()
  const [url, setUrl] = useState<string | null>(image?.public_url || null)
  const [imageId, setImageId] = useState<string>(content?.image_id || '')
  const [caption, setCaption] = useState(content?.caption || '')
  const [alt, setAlt] = useState(content?.alt_text || '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  useDebounced(() => imageId && onSave({ image_id: imageId, caption: caption.trim() || undefined, alt_text: alt.trim() || undefined }), [caption, alt], !isDraft)

  const pick = async (file?: File) => {
    if (!file || !session?.access_token) return
    try {
      setUploading(true)
      const img = await uploadImage(file, 'news_image', session.access_token)
      setUrl(img.public_url)
      setImageId(img.id)
      onSave({ image_id: img.id, caption: caption.trim() || undefined, alt_text: alt.trim() || undefined })
    } catch (e: any) {
      showToast('error', e.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <figure>
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
      {url ? (
        <button type="button" onClick={() => fileRef.current?.click()} className="group/img relative block w-full" aria-label="Replace image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={alt || ''} className="block w-full rounded-lg" />
          <span className="absolute right-3 top-3 rounded-md bg-ink/80 px-2.5 py-1 text-[13px] font-semibold opacity-0 group-hover/img:opacity-100">{uploading ? 'Uploading…' : 'Replace'}</span>
        </button>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-control text-text-tertiary hover:border-text-tertiary hover:text-text-primary">
          <span className="font-semibold">{uploading ? 'Uploading…' : 'Choose an image'}</span>
          <span className="text-[13px]">JPG, PNG, WebP or GIF · up to 5 MB</span>
        </button>
      )}
      <figcaption>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          aria-label="Caption"
          placeholder="Caption (optional)"
          className="mt-2 w-full bg-transparent py-1 text-center text-sm text-text-tertiary placeholder:text-text-disabled focus:outline-none"
        />
      </figcaption>
      <div className={cn('mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md px-3 py-2.5', !alt || looksLikeFileName(alt) ? 'bg-[#1E1A12]' : 'bg-paper')}>
        <label htmlFor={`alt-${imageId || 'new'}`} className={cn('whitespace-nowrap text-[13px] font-semibold', !alt || looksLikeFileName(alt) ? 'text-signal' : 'text-text-secondary')}>
          Describe the image
        </label>
        <input
          id={`alt-${imageId || 'new'}`}
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="What the picture shows, for screen readers"
          className="min-h-[34px] min-w-0 flex-[1_1_240px] rounded-md border border-control bg-ink px-2.5 text-[13px] text-text-secondary focus:border-link focus:outline-none"
        />
        {looksLikeFileName(alt) && <span className="basis-full text-xs text-text-tertiary">This is a file name. Screen readers read it out — write what the picture shows instead.</span>}
      </div>
    </figure>
  )
}

function YouTubeBlock({ content, onSave }: { content: any; onSave: (c: any) => void }) {
  const [url, setUrl] = useState(content?.youtube_url || '')
  const [title, setTitle] = useState(content?.title || '')
  const id = youtubeId(url)
  useDebounced(() => id && onSave({ youtube_url: url.trim(), video_id: id, title: title.trim() || undefined }), [url, title], true)

  return (
    <div>
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="YouTube link"
          placeholder="Paste a YouTube link"
          className="min-h-[40px] min-w-0 flex-[1_1_300px] rounded-md border border-control bg-paper px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-link focus:outline-none"
        />
        {url && <span className={cn('text-[13px]', id ? 'text-[#6FD39F]' : 'text-signal')}>{id ? '✓ Video found' : 'Not a YouTube link'}</span>}
      </div>
      {id && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" className="aspect-video w-full rounded-lg object-cover" />
      )}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Video caption"
        placeholder="Caption (optional)"
        className="mt-2 w-full bg-transparent py-1 text-center text-sm text-text-tertiary placeholder:text-text-disabled focus:outline-none"
      />
    </div>
  )
}
