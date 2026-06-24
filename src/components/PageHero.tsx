import { ReactNode } from 'react'

interface PageHeroProps {
  /** Main heading — rendered with the brand gradient. */
  title: string
  /** Bold one-line tagline beneath the title. */
  subtitle?: string
  /** Supporting paragraph beneath the subtitle. */
  description?: string
  /**
   * Optional content rendered below the description, still inside the hero
   * container (e.g. a CTA banner or a stats strip).
   */
  children?: ReactNode
}

/**
 * Shared hero for the main pages (products, posts, members, contest, education).
 * One source of truth so every page opens the same way: gradient title,
 * centered, light padding. The hero stays transparent so the global neural-net
 * background reads continuously with the rest of the page — no separate panel
 * tint that would make the header look pasted-in. Edit here to restyle all
 * pages at once.
 */
export function PageHero({ title, subtitle, description, children }: PageHeroProps) {
  return (
    <section className="relative py-10 px-4 sm:px-6 sm:py-16 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading leading-[1.1] sm:leading-[1.05] mb-4 sm:mb-5 break-words">
            <span className="gradient-text">{title}</span>
          </h1>

          {subtitle && (
            <p className="text-base sm:text-xl md:text-2xl font-semibold text-text-primary mb-4 sm:mb-5">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-sm sm:text-lg text-text-secondary leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {children}
      </div>
    </section>
  )
}
