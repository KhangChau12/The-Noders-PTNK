import Link from 'next/link'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Shared primitives for the site's visual system (Oct 2026, "v4"):
 * a navy colour field opens each page and closes it (footer); content in
 * between sits on ink with hierarchy from type, rules and whitespace.
 *
 * ALIGNMENT RULE: every horizontal band (nav, page intro, sections, footer)
 * wraps its content in <Container>. Never hand-roll max-width / side padding,
 * so all left and right edges line up on every page.
 */

export const CONTAINER_CLASS = 'mx-auto w-full max-w-[1280px] px-[clamp(20px,4vw,48px)]'

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn(CONTAINER_CLASS, className)}>{children}</div>
}

/** Small monospace label: dates and numbers. */
export function Mono({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn('font-mono text-[13px] text-text-tertiary', className)}>{children}</span>
}

export function SectionTitle({ className, children, id }: { className?: string; children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className={cn('text-[28px] sm:text-[34px] lg:text-[40px] font-bold leading-[1.15] tracking-[-0.025em] text-text-primary', className)}>
      {children}
    </h2>
  )
}

/** Section title on the left, a "view all" link on the right. */
export function SectionHeader({ title, href, linkLabel, className }: { title: ReactNode; href?: string; linkLabel?: string; className?: string }) {
  return (
    <div className={cn('mb-8 sm:mb-9 flex flex-wrap items-baseline justify-between gap-3', className)}>
      <SectionTitle>{title}</SectionTitle>
      {href && linkLabel && (
        <Link href={href} className="text-[15px] font-semibold text-link hover:text-text-primary transition-colors">
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}

type LinkProps = { href: string; className?: string; children: ReactNode; external?: boolean }

function externalProps(external?: boolean) {
  return external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
}

/** Primary action on ink: near-white fill, ink text. */
export function PrimaryLink({ href, className, children, external }: LinkProps) {
  return (
    <Link
      href={href}
      {...externalProps(external)}
      className={cn(
        'inline-flex min-h-[50px] items-center gap-2.5 rounded-md bg-text-primary px-[22px] font-semibold text-ink transition-colors hover:bg-white',
        className
      )}
    >
      {children}
    </Link>
  )
}

/** Secondary action on ink: hairline outline. */
export function SecondaryLink({ href, className, children, external }: LinkProps) {
  return (
    <Link
      href={href}
      {...externalProps(external)}
      className={cn(
        'inline-flex min-h-[50px] items-center gap-2.5 rounded-md border border-[#3A3F4B] px-[22px] font-semibold text-text-primary transition-colors hover:border-text-tertiary',
        className
      )}
    >
      {children}
    </Link>
  )
}

/** Inline text link in the accent colour. */
export function TextLink({ href, className, children, external }: LinkProps) {
  return (
    <Link href={href} {...externalProps(external)} className={cn('font-semibold text-link hover:text-text-primary transition-colors', className)}>
      {children}
    </Link>
  )
}

/**
 * "What's happening now" box that sits inside the navy page intro.
 * `live` switches the dot to the signal colour — only when something is open.
 */
export function StatusCard({ label, title, live = false, children }: { label: string; title: ReactNode; live?: boolean; children?: ReactNode }) {
  return (
    <aside aria-label="Current status" className="flex flex-col gap-2.5 rounded-[10px] border border-white/30 p-6 text-white">
      <p className="flex items-center gap-2.5 text-sm text-on-navy">
        <span className={cn('inline-block h-2 w-2 rounded-full', live ? 'bg-signal' : 'bg-[#9FB0CF]')} />
        {label}
      </p>
      <p className="text-[19px] font-bold leading-snug tracking-[-0.01em]">{title}</p>
      {children && <div className="mt-1 flex flex-wrap gap-x-6 gap-y-2.5 text-[15px] font-semibold">{children}</div>}
    </aside>
  )
}

/** Link styled for use on the navy field. */
export function NavyLink({ href, className, children, external }: LinkProps) {
  return (
    <Link
      href={href}
      {...externalProps(external)}
      className={cn('text-white underline underline-offset-[3px] hover:text-on-navy transition-colors', className)}
    >
      {children}
    </Link>
  )
}

/** Grey call-to-action panel, kept visually separate from the navy footer. */
export function CtaPanel({ title, body, children, className }: { title: ReactNode; body?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-x-16 gap-y-6 rounded-xl bg-paper p-7 sm:p-10 lg:p-12', className)}>
      <div className="min-w-0 flex-[1_1_520px]">
        <h2 className="mb-2 text-2xl sm:text-[32px] font-bold leading-tight tracking-[-0.02em] text-text-primary">{title}</h2>
        {body && <p className="text-text-secondary">{body}</p>}
      </div>
      {children}
    </div>
  )
}

/** Filter toggle for category / status / topic chips. */
export function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-md border px-3.5 text-sm font-medium whitespace-nowrap transition-colors',
        active
          ? 'border-[#4A6BA8] bg-navy text-white'
          : 'border-control text-text-secondary hover:border-text-tertiary hover:text-text-primary'
      )}
    >
      {children}
    </button>
  )
}

/** Search field styled for the navy page intro. */
export function NavySearch({ id, label, placeholder, value, onChange }: { id: string; label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-on-navy">
        {label}
      </label>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[48px] w-full rounded-md border border-white/35 bg-white/[0.08] px-3.5 text-[15px] text-white placeholder:text-[#B9C6E0] focus:border-white/70 focus:outline-none"
      />
    </div>
  )
}

/** Breadcrumb trail for the top of a navy intro. The last item is the current page. */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-on-navy">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="opacity-60">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Big-number facts row along the bottom edge of a navy intro. */
export function NavyFacts({ facts, className }: { facts: { value: ReactNode; label: string }[]; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-2 border-t border-white/[0.22] sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]', className)}>
      {facts.map((f) => (
        <div key={f.label} className="flex flex-col-reverse gap-1.5 pt-[22px] pb-[26px] pr-5">
          <dt className="text-sm text-on-navy">{f.label}</dt>
          <dd className="font-mono text-[28px] font-medium leading-none tracking-[-0.02em] text-white">{f.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Primary action on the navy field: white fill, navy text. */
export function NavyPrimaryLink({ href, className, children, external }: LinkProps) {
  return (
    <Link
      href={href}
      {...externalProps(external)}
      className={cn('inline-flex min-h-[48px] items-center gap-2.5 rounded-md bg-white px-5 font-semibold text-navy-dark transition-colors hover:bg-on-navy', className)}
    >
      {children}
    </Link>
  )
}

/** Secondary action on the navy field: white hairline. */
export function NavySecondaryLink({ href, className, children, external }: LinkProps) {
  return (
    <Link
      href={href}
      {...externalProps(external)}
      className={cn('inline-flex min-h-[48px] items-center gap-2.5 rounded-md border border-white/55 px-5 font-semibold text-white transition-colors hover:border-white', className)}
    >
      {children}
    </Link>
  )
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('h-5 w-5 fill-navy-dark', className)}>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

/** YouTube id from any watch / embed / youtu.be URL. */
export function youtubeId(url?: string | null) {
  if (!url) return null
  const m = url.match(/(?:v=|embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

/**
 * Click-to-play YouTube: shows the real thumbnail until clicked, then swaps in
 * the iframe. Keeps pages light (no iframe until wanted).
 */
export { VideoPlayer } from './VideoPlayer'
