'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Photo or initials — one quiet colour, no rainbow. */
export function MemberAvatar({ name, src, className }: { name?: string | null; src?: string | null; className?: string }) {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase()
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn('object-cover', className)} />
  }
  return (
    <span aria-hidden="true" className={cn('inline-flex items-center justify-center bg-[#2A4B8D] font-semibold text-white', className)}>
      {initials}
    </span>
  )
}

/** Four-segment completeness bar used on product cards. */
export function Segments({ done, total = 4, className }: { done: number; total?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('grid flex-auto gap-[3px]', className)} style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn('h-1 rounded-sm', i < done ? 'bg-[#5B7FD6]' : 'bg-control')} />
      ))}
    </span>
  )
}

export function SectionHeading({ id, children, action }: { id?: string; children: ReactNode; action?: { href: string; label: string } }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 id={id} className="text-[22px] font-bold tracking-[-0.01em] text-text-primary">
        {children}
      </h2>
      {action && (
        <Link href={action.href} className="text-sm font-semibold text-link hover:text-text-primary transition-colors">
          {action.label} →
        </Link>
      )}
    </div>
  )
}

export const btnPrimary =
  'inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md bg-text-primary px-4 text-sm font-semibold text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-[#2A2E37] disabled:text-text-disabled'
export const btnSecondary =
  'inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md border border-control px-4 text-sm font-semibold text-text-primary transition-colors hover:border-text-tertiary disabled:cursor-not-allowed disabled:opacity-50'
export const btnGhost =
  'inline-flex min-h-[38px] items-center justify-center rounded-md px-2.5 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary'
export const fieldClass =
  'w-full rounded-md border border-control bg-paper px-3.5 text-[15px] text-text-primary placeholder:text-text-disabled focus:border-link focus:outline-none'
export const labelClass = 'mb-1.5 block text-sm font-semibold text-text-primary'
export const hintClass = 'mt-1.5 text-[13px] text-text-tertiary'

/** Screen-reader-only text. */
export function SrOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>
}
