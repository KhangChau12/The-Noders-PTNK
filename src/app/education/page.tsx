import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { PageHero } from '@/components/PageHero'
import { Container, CtaPanel, Mono, NavyLink, PrimaryLink, SectionTitle, StatusCard, TextLink } from '@/components/editorial'
import { COURSES, NEXT_COURSE } from '@/lib/programs'
import { SOCIAL_LINKS } from '@/lib/constants'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Education - The Noders Community',
  description:
    'Short courses in data science and AI, taught by students for students at High School for the Gifted VNUHCM. Each session pairs one concept with hands-on practice.',
  keywords: ['AI education', 'data science course', 'student workshop', 'PTNK training', 'machine learning course'],
  url: '/education',
})

export default function EducationPage() {
  return (
    <div>
      <PageHero
        eyebrow="Education"
        title="Short courses, by students, for students."
        description="Small-group courses for students starting out in data and AI. Each session pairs one concept with hands-on practice."
        aside={
          NEXT_COURSE ? (
            <StatusCard label={NEXT_COURSE.open ? 'Enrolment open' : 'Coming up'} title={NEXT_COURSE.name} live={NEXT_COURSE.open}>
              <NavyLink href={NEXT_COURSE.href}>Details</NavyLink>
            </StatusCard>
          ) : (
            <StatusCard label="No course enrolling right now" title="The next one is announced on Facebook first.">
              <NavyLink href={SOCIAL_LINKS.facebook} external>
                Get notified when enrolment opens
              </NavyLink>
            </StatusCard>
          )
        }
      />

      <section className="pt-20 sm:pt-[88px]">
        <Container>
          <SectionTitle className="mb-8">Past courses</SectionTitle>

          {COURSES.map((course) => (
            <div key={course.slug} className="mb-16 last:mb-0">
              <article data-reveal className="rounded-xl bg-paper p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-x-14 gap-y-10">
                  <div className="relative aspect-video min-w-0 flex-[1_1_440px] overflow-hidden rounded-lg">
                    <Image src={course.coverImage} alt={course.coverAlt} fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
                  </div>

                  <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-[18px]">
                    <p className="text-sm font-semibold text-link">
                      {[course.kind, course.partner ? `with ${course.partner}` : null, course.status === 'ended' ? 'Ended' : course.status === 'open' ? 'Open' : 'Upcoming']
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <h3 className="text-2xl sm:text-[34px] font-bold leading-[1.12] tracking-[-0.025em] text-text-primary">{course.title}</h3>
                    <p className="text-text-secondary leading-relaxed">{course.description}</p>
                    <dl className="grid grid-cols-3 gap-6 border-y border-[#2A2E37] py-[18px]">
                      <div>
                        <dt className="text-[13px] text-text-tertiary">For</dt>
                        <dd className="font-semibold text-text-primary">{course.audience}</dd>
                      </div>
                      <div>
                        <dt className="text-[13px] text-text-tertiary">Format</dt>
                        <dd className="font-semibold text-text-primary">{course.format}</dd>
                      </div>
                      <div>
                        <dt className="text-[13px] text-text-tertiary">When</dt>
                        <dd className="font-semibold text-text-primary">{course.when}</dd>
                      </div>
                    </dl>
                    <div className="flex flex-wrap gap-x-7 gap-y-2.5 text-[15px] font-semibold">
                      <TextLink href={`/education/${course.slug}`}>Course page →</TextLink>
                      {course.slidesUrl && (
                        <a href={course.slidesUrl} target="_blank" rel="noopener noreferrer" className="text-text-primary hover:text-link transition-colors">
                          All slides ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>

              {/* Syllabus */}
              <h3 className="mt-[72px] mb-1.5 text-2xl font-bold tracking-[-0.015em] text-text-primary">
                What the {course.sessions.length} sessions covered
              </h3>
              <p className="mb-6 text-[15px] text-text-secondary">
                Each session: concept first, then a hands-on notebook. Slides and recordings are on each session page.
              </p>
              <ol data-stagger className="border-b border-rule">
                {course.sessions.map((s) => (
                  <li key={s.n} className="border-t border-rule">
                    <Link href={`/education/${course.slug}/session/${s.n}`} className="group flex flex-wrap gap-x-10 gap-y-3 py-[26px]">
                      <Mono className="flex-[0_0_110px] pt-1 text-link">Session {String(s.n).padStart(2, '0')}</Mono>
                      <div className="min-w-0 flex-[1_1_380px]">
                        <div className="mb-1 text-[19px] font-bold tracking-[-0.01em] text-text-primary group-hover:text-link transition-colors">
                          {s.title}
                        </div>
                        <div className="text-[15px] text-text-secondary">{s.goal}</div>
                      </div>
                      <span className="min-w-0 flex-[1_1_300px] pt-[3px] text-sm text-text-tertiary">{s.topics.join(' · ')}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </Container>
      </section>

      <section className="pt-20 pb-20 sm:pt-[104px] sm:pb-28">
        <Container>
          <CtaPanel title="Want to run a course with us?" body="Schools, clubs and organisations can co-host a course, as PRISEE did.">
            <PrimaryLink href="/contact">Get in touch</PrimaryLink>
          </CtaPanel>
        </Container>
      </section>
    </div>
  )
}
