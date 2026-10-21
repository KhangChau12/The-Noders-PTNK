import Link from 'next/link'
import Image from 'next/image'
import type { Course, CourseSession } from '@/lib/programs'
import { SOCIAL_LINKS } from '@/lib/constants'
import { Breadcrumb, Container, CtaPanel, NavyPrimaryLink, PrimaryLink, SecondaryLink, SectionTitle } from '@/components/editorial'

const MATERIALS: { key: keyof CourseSession['materials']; label: string; icon: string }[] = [
  { key: 'slides', label: 'Slides', icon: '▭' },
  { key: 'video', label: 'Recording', icon: '▶' },
  { key: 'notes', label: 'Notes', icon: '¶' },
  { key: 'notebook', label: 'Notebook', icon: '{}' },
]

/**
 * Course hub. A finished course's visitors come for the materials, so every
 * session lists its slides / recording / notes / notebook as direct links.
 */
export function CourseDetail({ course }: { course: Course }) {
  const notebooks = course.sessions.filter((s) => s.materials.notebook).length
  const statusLine = course.status === 'ended' ? `Completed ${course.when}` : course.status === 'open' ? 'Enrolling now' : 'Coming up'

  return (
    <div>
      <section className="bg-navy text-white">
        <Container className="pt-11 pb-14">
          <Breadcrumb items={[{ label: 'Education', href: '/education' }, { label: course.shortTitle }]} />
          <div className="flex flex-wrap items-end gap-x-[72px] gap-y-10">
            <div className="min-w-0 flex-[1_1_520px]">
              <p className="mb-3.5 text-[15px] text-on-navy">
                {course.kind} · The Noders{course.partner ? ` × ${course.partner}` : ''} · {statusLine}
              </p>
              <h1 className="mb-[18px] text-[32px] sm:text-[40px] lg:text-[50px] font-bold leading-[1.06] tracking-[-0.03em]">{course.title}</h1>
              <p className="max-w-[580px] text-lg text-on-navy">
                {course.sessions.length} sessions for {course.audience.toLowerCase()} students with no background.
                {course.status === 'ended' && ' The course has ended — every slide deck, recording, note and notebook is open below, free.'}
              </p>
            </div>
            <div className="flex min-w-0 flex-[0_1_380px] flex-col gap-3">
              <NavyPrimaryLink href={`/education/${course.slug}/session/1`} className="min-h-[52px] justify-between">
                Start with session 1 <span aria-hidden="true">→</span>
              </NavyPrimaryLink>
              <p className="text-sm text-on-navy">
                {course.sessions.length} recorded sessions · {course.sessions.length} slide decks · {notebooks} Colab notebooks
              </p>
            </div>
          </div>

          {/* The real structure of the course */}
          <ol aria-label="Course structure" className="mt-12 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-white/[0.22] pt-[22px] sm:grid-cols-2 lg:grid-cols-4">
            {course.sessions.map((s) => (
              <li key={s.n} className="flex flex-col gap-1">
                <span className="font-mono text-[13px] text-on-navy">{String(s.n).padStart(2, '0')} · {s.date}</span>
                <span className="text-xl font-bold leading-tight">{s.pillar}</span>
                <span className="text-sm text-on-navy">{s.tools}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="pt-[72px]">
        <Container className="flex flex-wrap items-start gap-x-16 gap-y-12">
          <div className="min-w-0 flex-[1_1_680px]">
            <SectionTitle className="mb-2">Sessions &amp; materials</SectionTitle>
            <p className="mb-7 text-text-secondary">Open any material straight from here, or open a session for everything side by side.</p>

            <ol className="border-b border-rule">
              {course.sessions.map((s) => (
                <li key={s.n} className="grid grid-cols-[48px_1fr] gap-x-5 border-t border-rule py-7 sm:grid-cols-[64px_1fr]">
                  <span className="font-mono text-[28px] sm:text-[32px] font-medium leading-none text-link">{String(s.n).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <div className="mb-0.5 text-sm text-text-tertiary">{s.date} · {s.pillar}</div>
                    <h3 className="mb-1.5 text-[21px] font-bold leading-snug tracking-[-0.01em]">
                      <Link href={`/education/${course.slug}/session/${s.n}`} className="text-text-primary hover:text-link transition-colors">
                        {s.title}
                      </Link>
                    </h3>
                    <p className="mb-1.5 text-[#C9CED8]">{s.goal}</p>
                    <p className="mb-[18px] text-sm text-text-tertiary">{s.topics.join(' · ')}</p>
                    <div className="flex flex-wrap gap-2">
                      {MATERIALS.map((m) => {
                        const url = s.materials[m.key]
                        return url ? (
                          <a
                            key={m.key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-control px-3.5 text-sm font-medium text-[#C9CED8] transition-colors hover:border-link hover:text-white"
                          >
                            <span aria-hidden="true" className="font-mono text-xs text-link">{m.icon}</span>
                            {m.label}
                          </a>
                        ) : (
                          <span key={m.key} className="inline-flex min-h-[40px] items-center rounded-md border border-dashed border-[#2A2E37] px-3.5 text-sm text-text-disabled">
                            {m.label} — none
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="flex min-w-0 flex-[0_1_340px] flex-col gap-5 lg:sticky lg:top-[100px]">
            <div className="rounded-xl bg-paper p-6">
              <h2 className="mb-3.5 text-[17px] font-bold text-text-primary">How to study it on your own</h2>
              <ol className="flex list-decimal flex-col gap-2.5 pl-5 text-[15px] text-[#C9CED8]">
                <li>Watch the recording with the slides open beside it.</li>
                <li>Read the notes for anything you missed.</li>
                <li>Do the Colab notebook before moving on — later sessions build on it.</li>
              </ol>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 rounded-xl bg-paper p-6 text-[15px]">
              <dt className="text-text-tertiary">For</dt><dd className="text-right text-text-primary">{course.audience}</dd>
              <dt className="text-text-tertiary">Background</dt><dd className="text-right text-text-primary">None required</dd>
              <dt className="text-text-tertiary">Ran</dt><dd className="text-right text-text-primary">{course.ran}</dd>
              <dt className="text-text-tertiary">Organisers</dt><dd className="text-right text-text-primary">The Noders{course.partner ? ` × ${course.partner}` : ''}</dd>
              <dt className="text-text-tertiary">Materials</dt><dd className="text-right text-text-primary">Free &amp; open</dd>
            </dl>
            {course.announcementSlug && (
              <Link href={`/posts/${course.announcementSlug}`} className="group block rounded-xl bg-paper px-6 py-5">
                <span className="block text-[13px] text-text-tertiary">Announcement</span>
                <span className="block font-semibold leading-snug text-text-primary group-hover:text-link transition-colors">
                  {course.partner} × The Noders: {course.shortTitle} course for beginners
                </span>
              </Link>
            )}
          </aside>
        </Container>
      </section>

      <section className="pt-[104px] pb-20 sm:pb-28">
        <Container>
          <CtaPanel title="Want the next one live?" body="New courses are announced on Facebook first. Finished this one? Our contests are the natural next step.">
            <div className="flex flex-wrap gap-3">
              <PrimaryLink href={SOCIAL_LINKS.facebook} external>Get notified</PrimaryLink>
              <SecondaryLink href="/contest">See the contests</SecondaryLink>
            </div>
          </CtaPanel>
        </Container>
      </section>
    </div>
  )
}
