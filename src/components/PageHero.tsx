import { ReactNode } from 'react'
import { Container } from './editorial'

interface PageHeroProps {
  /** Small plain label above the title — usually the page name. */
  eyebrow?: string
  /** Main heading: one plain sentence about what the page holds. */
  title: string
  /** Supporting paragraph beneath the title. */
  description?: string
  /** @deprecated Older call sites passed a tagline here; it renders as the description when none is given. */
  subtitle?: string
  /**
   * Optional right-hand column aligned to the bottom of the title block —
   * e.g. a StatusCard or a NavySearch field.
   */
  aside?: ReactNode
  /** Optional content rendered under the title block, still in the navy field. */
  children?: ReactNode
}

/**
 * Shared page intro for the main pages: a navy colour field directly under
 * the (separate, glass) nav. Left-aligned, compact. Edit here to restyle
 * every page intro at once.
 */
export function PageHero({ eyebrow, title, description, subtitle, aside, children }: PageHeroProps) {
  const body = description ?? subtitle

  return (
    <section className="bg-navy text-white">
      <Container className="pt-14 pb-16 sm:pt-16 sm:pb-[72px]">
        <div className="flex flex-wrap items-end gap-x-16 gap-y-8">
          <div className="min-w-0 flex-[1_1_520px]">
            {eyebrow && <p className="mb-[18px] text-[15px] text-on-navy">{eyebrow}</p>}
            <h1 className="mb-[18px] text-[32px] sm:text-[40px] lg:text-[46px] font-bold leading-[1.08] tracking-[-0.03em] break-words">
              {title}
            </h1>
            {body && <p className="max-w-[560px] text-base sm:text-lg leading-relaxed text-on-navy">{body}</p>}
          </div>
          {aside && <div className="min-w-0 flex-[0_1_380px]">{aside}</div>}
        </div>
        {children}
      </Container>
    </section>
  )
}
