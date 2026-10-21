import Link from 'next/link'
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { PageHero } from '@/components/PageHero'
import { Container, NavyLink, SectionTitle, StatusCard, TextLink } from '@/components/editorial'
import { CONTESTS, CONTEST_PLATFORM_URL, NEXT_CONTEST } from '@/lib/programs'
import { SOCIAL_LINKS } from '@/lib/constants'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Contests - The Noders Community',
  description:
    'AI contests run by students at High School for the Gifted VNUHCM: real datasets, hidden test sets and a public leaderboard, with workshops for beginners.',
  keywords: ['AI competition', 'machine learning contest', 'student competition', 'PTNK challenge', 'learn by doing'],
  url: '/contest',
})

const PHASES = [
  {
    n: '01',
    tag: 'Registration',
    title: 'Form a team, get the data',
    body: 'Teams of 1–3. A kickoff workshop walks beginners through a first working model.',
  },
  {
    n: '02',
    tag: 'Public test',
    title: 'Submit, see your score',
    body: 'Upload predictions as CSV. They are graded instantly against part of the test set.',
  },
  {
    n: '03',
    tag: 'Private test',
    title: 'Hidden data decides it',
    body: 'Final ranking uses data nobody has seen, so overfitting the public board does not pay.',
  },
]

const platformLink = (
  <a href={CONTEST_PLATFORM_URL} target="_blank" rel="noopener noreferrer" className="text-on-navy hover:text-white transition-colors">
    Open the platform ↗
  </a>
)

export default function ContestPage() {
  return (
    <div>
      <PageHero
        eyebrow="Contests"
        title="AI contests, run by students, on real data."
        description="Modelled on VOAI and IOAI: a real dataset, a hidden test set, and a leaderboard that only settles at the end. Each contest opens with a workshop or tutorial for beginners."
        aside={
          NEXT_CONTEST ? (
            <StatusCard label={NEXT_CONTEST.open ? 'Registration open' : 'Coming up'} title={NEXT_CONTEST.name} live={NEXT_CONTEST.open}>
              <NavyLink href={NEXT_CONTEST.href}>Details</NavyLink>
              {platformLink}
            </StatusCard>
          ) : (
            <StatusCard label="No contest open right now" title="The next one is announced on Facebook first.">
              <NavyLink href={SOCIAL_LINKS.facebook} external>
                Get notified
              </NavyLink>
              {platformLink}
            </StatusCard>
          )
        }
      />

      {/* How it works */}
      <section aria-labelledby="how" className="pt-20 sm:pt-[88px]">
        <Container>
          <SectionTitle id="how" className="mb-8 !text-[26px] sm:!text-[34px]">
            How every contest runs
          </SectionTitle>
          <ol className="grid grid-cols-1 gap-x-12 md:grid-cols-3">
            {PHASES.map((phase) => (
              <li key={phase.n} className="flex flex-col gap-2 border-t-2 border-link pt-5 pb-2">
                <span className="text-sm font-semibold text-link">
                  {phase.n} · {phase.tag}
                </span>
                <span className="text-xl font-bold tracking-[-0.01em] text-text-primary">{phase.title}</span>
                <span className="text-[15px] leading-relaxed text-text-secondary">{phase.body}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Archive */}
      <section className="pt-20 pb-20 sm:pt-[104px] sm:pb-28">
        <Container>
          <SectionTitle className="mb-2">Archive</SectionTitle>
          <p className="mb-10 text-text-secondary">Every contest we&apos;ve run, with its problem and final results.</p>

          <div className="flex flex-col gap-6">
            {CONTESTS.map((contest) => (
              <article key={contest.slug} className="flex flex-wrap gap-x-14 gap-y-8 rounded-xl bg-paper p-6 sm:p-8 lg:p-10">
                {/* Meta column */}
                <div className="min-w-0 flex-[0_1_240px]">
                  <div className="mb-2 font-mono text-[52px] font-medium leading-none tracking-[-0.04em] text-text-primary">
                    {contest.year}
                  </div>
                  <div className="mb-[22px] text-sm font-semibold text-link">
                    {contest.kind} · {contest.status === 'ended' ? 'Ended' : contest.status === 'open' ? 'Open' : 'Upcoming'}
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
                    {contest.meta.map((m) => (
                      <div key={m.label} className="contents">
                        <dt className="text-text-tertiary">{m.label}</dt>
                        <dd className="text-right font-mono text-text-primary">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Content column */}
                <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-[18px]">
                  <div>
                    <h3 className="mb-2.5 text-2xl sm:text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-text-primary">
                      {contest.title}
                    </h3>
                    <p className="max-w-[640px] text-text-secondary leading-relaxed">{contest.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-x-8 gap-y-2 border-y border-[#2A2E37] py-3.5 text-[15px] text-text-primary">
                    <span>
                      <span className="text-text-tertiary">Task </span>
                      {contest.task}
                    </span>
                    <span>
                      <span className="text-text-tertiary">Metric </span>
                      {contest.metric}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[440px] border-collapse text-[15px]">
                      <caption className="pb-2 text-left text-[13px] text-text-tertiary">{contest.standings.caption}</caption>
                      <thead>
                        <tr className="text-left text-[13px] text-text-tertiary">
                          <th scope="col" className="w-10 py-2 font-medium">#</th>
                          <th scope="col" className="py-2 font-medium">{contest.standings.nameCol}</th>
                          <th scope="col" className="py-2 text-right font-medium">{contest.standings.colA}</th>
                          <th scope="col" className="py-2 text-right font-medium">{contest.standings.colB}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contest.standings.rows.map((row, i) => (
                          <tr key={row.name} className="border-t border-[#2A2E37]">
                            <td className={cn('py-[11px] font-mono', i === 0 ? 'text-link' : 'text-text-tertiary')}>
                              {String(i + 1).padStart(2, '0')}
                            </td>
                            <td className="py-[11px] font-semibold text-text-primary">{row.name}</td>
                            <td className="py-[11px] text-right font-mono text-text-secondary">{row.a}</td>
                            <td className="py-[11px] text-right font-mono text-text-primary">{row.b}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap gap-x-7 gap-y-2.5 text-[15px] font-semibold">
                    <TextLink href={`/contest/${contest.slug}`}>Problem &amp; full leaderboard →</TextLink>
                    {contest.postSlug && (
                      <Link href={`/posts/${contest.postSlug}`} className="text-text-primary hover:text-link transition-colors">
                        {contest.postLabel}
                      </Link>
                    )}
                    <a
                      href={contest.video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-primary hover:text-link transition-colors"
                    >
                      {contest.video.label} ↗
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </div>
  )
}
