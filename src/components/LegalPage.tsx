import Link from 'next/link'
import type { ReactNode } from 'react'
import { Container } from '@/components/editorial'
import { formatDay } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

/** Change this when the wording of either policy changes. */
export const LEGAL_UPDATED = '2026-10-21'

export interface LegalSection {
  id: string
  title: string
  body: ReactNode
}

const TABS = [
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms of service' },
]

export function LegalPage({ active, title, sections }: { active: '/privacy' | '/terms'; title: string; sections: LegalSection[] }) {
  return (
    <Container className="pb-28 pt-14">
      <nav aria-label="Policies" className="mb-9 flex gap-[22px] border-b border-rule text-[15px] font-medium">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.href === active ? 'page' : undefined}
            className={cn('-mb-px border-b-2 pb-3 pt-2.5', t.href === active ? 'border-link text-white' : 'border-transparent text-text-secondary hover:text-text-primary')}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-wrap items-start gap-x-[72px] gap-y-8">
        <nav aria-label="On this page" className="min-w-0 flex-[0_1_220px] text-sm lg:sticky lg:top-[100px]">
          <p className="mb-2.5 text-text-tertiary">On this page</p>
          <ol className="flex list-decimal flex-col gap-2 pl-[18px] text-text-disabled">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-text-secondary hover:text-text-primary">{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="min-w-0 max-w-[720px] flex-[1_1_640px] text-[17px] leading-[1.75] text-[#D5D9E0] [&_li]:mb-1.5 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-[22px] [&_p]:mb-3.5">
          <h1 className="mb-1.5 text-[clamp(30px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.025em] text-text-primary">{title}</h1>
          <p className="!mb-10 text-[15px] text-text-tertiary">Last updated {formatDay(LEGAL_UPDATED)} · applies to thenodersptnk.com</p>
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 pb-6">
              <h2 className="mb-2.5 text-[22px] font-bold tracking-[-0.01em] text-text-primary">
                {i + 1}. {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </article>
      </div>
    </Container>
  )
}
