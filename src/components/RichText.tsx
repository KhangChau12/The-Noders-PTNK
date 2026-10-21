'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Small rich-text field: headings, bold, italic, lists and links.
 * Used for post text blocks and product write-ups. Output is cleaned of inline
 * styles and attributes browser extensions inject (e.g. bis_skin_checked).
 */
export function cleanHtml(html: string) {
  return html
    .replace(/\s+(style|class|bis_skin_checked|data-[\w-]+)="[^"]*"/gi, '')
    .replace(/<span>([\s\S]*?)<\/span>/gi, '$1')
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>')
}

export const plainText = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
export const countWords = (html: string) => (plainText(html) ? plainText(html).split(' ').length : 0)

const CONTENT =
  'min-h-[120px] text-[17px] leading-[1.75] text-[#D5D9E0] outline-none ' +
  '[&_h2]:mb-2.5 [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-[-0.015em] [&_h2]:text-text-primary first:[&_h2]:mt-0 ' +
  '[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-[19px] [&_h3]:font-bold [&_h3]:text-text-primary ' +
  '[&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 ' +
  '[&_a]:text-link [&_a]:underline [&_a]:underline-offset-[3px] [&_b]:text-text-primary [&_strong]:text-text-primary ' +
  'empty:before:pointer-events-none empty:before:text-text-disabled empty:before:content-[attr(data-placeholder)]'

interface RichTextProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  label: string
  /** Show the toolbar only while the field has focus (post blocks) or always (product write-up). */
  toolbar?: 'focus' | 'always'
  className?: string
  extra?: React.ReactNode
  onBlur?: () => void
}

export function RichText({ value, onChange, placeholder, label, toolbar = 'always', className, extra, onBlur }: RichTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const range = useRef<Range | null>(null)
  const [focused, setFocused] = useState(false)
  const [link, setLink] = useState<string | null>(null)

  // Only overwrite the DOM when the value changed from outside (keeps the caret)
  useEffect(() => {
    if (ref.current && cleanHtml(ref.current.innerHTML) !== value) ref.current.innerHTML = value || ''
  }, [value])

  const emit = () => ref.current && onChange(cleanHtml(ref.current.innerHTML))
  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus()
    document.execCommand(cmd, false, arg)
    emit()
  }

  const openLink = () => {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !ref.current?.contains(sel.anchorNode)) return
    range.current = sel.getRangeAt(0).cloneRange()
    const a = (sel.anchorNode?.parentElement as HTMLElement | null)?.closest('a')
    setLink(a?.getAttribute('href') || 'https://')
  }
  const applyLink = (href: string | null) => {
    const sel = window.getSelection()
    ref.current?.focus()
    if (range.current && sel) {
      sel.removeAllRanges()
      sel.addRange(range.current)
    }
    if (href) {
      document.execCommand('createLink', false, href)
      ref.current?.querySelectorAll('a[href]').forEach((a) => {
        a.setAttribute('target', '_blank')
        a.setAttribute('rel', 'noopener noreferrer')
      })
    } else document.execCommand('unlink')
    setLink(null)
    emit()
  }

  const showBar = toolbar === 'always' || focused || link !== null
  const btn = 'min-h-[30px] min-w-[32px] rounded-[5px] px-2 text-[13px] text-text-secondary hover:bg-white/[0.07] hover:text-white'
  const keep = (e: React.MouseEvent) => e.preventDefault() // don't steal the selection

  return (
    <div className={cn('relative', className)}>
      {showBar && (
        <div role="toolbar" aria-label="Formatting" className="mb-3 flex flex-wrap items-center gap-0.5">
          <button type="button" onMouseDown={keep} onClick={() => exec('formatBlock', '<h2>')} className={cn(btn, 'font-bold')}>H2</button>
          <button type="button" onMouseDown={keep} onClick={() => exec('formatBlock', '<h3>')} className={cn(btn, 'font-bold')}>H3</button>
          <button type="button" onMouseDown={keep} onClick={() => exec('formatBlock', '<p>')} className={btn}>Text</button>
          <span aria-hidden="true" className="mx-1 h-[18px] w-px bg-control" />
          <button type="button" onMouseDown={keep} onClick={() => exec('bold')} className={cn(btn, 'font-bold')} aria-label="Bold">B</button>
          <button type="button" onMouseDown={keep} onClick={() => exec('italic')} className={cn(btn, 'italic')} aria-label="Italic">I</button>
          <button type="button" onMouseDown={keep} onClick={openLink} className={cn(btn, link !== null && 'bg-rule text-white')}>Link</button>
          <span aria-hidden="true" className="mx-1 h-[18px] w-px bg-control" />
          <button type="button" onMouseDown={keep} onClick={() => exec('insertUnorderedList')} className={btn}>• List</button>
          <button type="button" onMouseDown={keep} onClick={() => exec('insertOrderedList')} className={btn}>1. List</button>
          {extra && <span className="ml-auto flex items-center gap-1">{extra}</span>}
        </div>
      )}
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          onBlur?.()
        }}
        onPaste={(e) => {
          // Paste as plain text; formatting comes from the toolbar
          e.preventDefault()
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
        }}
        className={CONTENT}
      />
      {link !== null && (
        <div role="dialog" aria-label="Edit link" className="absolute left-0 top-12 z-20 flex w-[min(360px,100%)] flex-col gap-2.5 rounded-[10px] border border-control bg-[#1C2027] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <input
            autoFocus
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applyLink(link.trim() && link.trim() !== 'https://' ? link.trim() : null)
              } else if (e.key === 'Escape') setLink(null)
            }}
            aria-label="Link address"
            className="min-h-[38px] rounded-md border border-control bg-ink px-2.5 text-sm text-text-primary focus:border-link focus:outline-none"
          />
          <div className="flex items-center gap-2 text-[13px]">
            <span className="flex-auto text-text-tertiary">Opens in a new tab</span>
            <button type="button" onClick={() => applyLink(null)} className="px-2 py-1.5 font-semibold text-text-tertiary hover:text-text-primary">Remove</button>
            <button type="button" onClick={() => applyLink(link.trim() && link.trim() !== 'https://' ? link.trim() : null)} className="min-h-[32px] rounded-md bg-text-primary px-3 font-semibold text-ink hover:bg-white">Apply</button>
          </div>
        </div>
      )}
    </div>
  )
}
