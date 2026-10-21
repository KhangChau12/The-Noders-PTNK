import Link from 'next/link'
import { SOCIAL_LINKS } from '@/lib/constants'
import { CONTESTS, COURSES, CONTEST_PLATFORM_URL } from '@/lib/programs'
import { Container } from './editorial'

type FooterLink = { href: string; label: string; external?: boolean }

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Explore',
    links: [
      { href: '/products', label: 'Products' },
      { href: '/posts', label: 'Posts' },
      { href: '/members', label: 'Members' },
      { href: '/contest', label: 'Contests' },
      { href: '/education', label: 'Education' },
    ],
  },
  {
    title: 'Programs',
    links: [
      ...CONTESTS.map((c) => ({ href: `/contest/${c.slug}`, label: c.shortName })),
      ...COURSES.map((c) => ({ href: `/education/${c.slug}`, label: 'Intro to Data Science & AI' })),
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/verify', label: 'Verify certificate' },
      { href: CONTEST_PLATFORM_URL, label: 'Competition platform ↗', external: true },
      { href: '/contact', label: 'Contact' },
    ],
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto overflow-hidden bg-navy text-white">
      <Container className="pt-[72px]">
        <div className="flex flex-wrap gap-x-16 gap-y-10 pb-10">
          <div className="flex min-w-0 flex-[1.3_1_280px] flex-col gap-3">
            <p className="max-w-[340px] text-[15px] text-on-navy">
              A student-led tech community at High School for the Gifted VNUHCM (PTNK).
            </p>
            <a href={`mailto:${SOCIAL_LINKS.email}`} className="text-[15px] font-semibold text-on-navy hover:text-white transition-colors">
              {SOCIAL_LINKS.email}
            </a>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-semibold text-on-navy hover:text-white transition-colors"
            >
              facebook.com/thenodersptnk ↗
            </a>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="min-w-0 flex-[1_1_150px]">
              <h3 className="mb-3.5 text-sm font-semibold text-white">{col.title}</h3>
              <ul className="flex flex-col gap-2.5 text-[15px]">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-on-navy hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Oversized wordmark as the page's sign-off; decorative only. */}
        <div
          aria-hidden="true"
          className="font-brand whitespace-nowrap text-[clamp(72px,15vw,210px)] leading-[0.8] text-[rgba(5,12,30,0.28)] -mb-[0.12em] -ml-[0.02em] select-none"
        >
          The Noders
        </div>
      </Container>

      <div className="bg-navy-dark">
        <Container className="flex flex-wrap justify-between gap-3 py-[18px] text-[13px] text-on-navy">
          <span>© {currentYear} The Noders Community · Built by members</span>
          <span className="flex gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </span>
        </Container>
      </div>
    </footer>
  )
}
