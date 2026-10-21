'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Course, CourseSession } from '@/lib/programs'
import { cn } from '@/lib/utils'
import { Container, VideoPlayer } from '@/components/editorial'

type Tab = 'video' | 'slides' | 'notes'

const TABS: { id: Tab; label: string; open: string }[] = [
  { id: 'video', label: 'Recording', open: 'Watch on YouTube' },
  { id: 'slides', label: 'Slides', open: 'Open slides' },
  { id: 'notes', label: 'Notes', open: 'Open notes' },
]

const embedUrl = (tab: Tab, s: CourseSession) => {
  if (tab === 'slides' && s.materials.slides) return `${s.materials.slides}?embed`
  if (tab === 'notes' && s.materials.notes) return `${s.materials.notes}?embedded=true`
  return null
}

/** Course player: outline on the left, one material at a time in the middle. */
export function SessionPlayer({ course, session }: { course: Course; session: CourseSession }) {
  const available = TABS.filter((t) => session.materials[t.id])
  const [tab, setTab] = useState<Tab>(available[0]?.id ?? 'video')
  const prev = course.sessions.find((s) => s.n === session.n - 1)
  const next = course.sessions.find((s) => s.n === session.n + 1)
  const openUrl = session.materials[tab]
  const current = TABS.find((t) => t.id === tab)!

  return (
    <div>
      {/* Slim navy course bar — a study page should get out of the way */}
      <section className="bg-navy text-white">
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 py-[18px]">
          <nav aria-label="Breadcrumb" className="text-[15px] text-on-navy">
            <Link href="/education" className="hover:text-white">Education</Link>
            <span aria-hidden="true" className="mx-2 opacity-60">/</span>
            <Link href={`/education/${course.slug}`} className="font-semibold text-white hover:text-on-navy">{course.shortTitle}</Link>
          </nav>
          <div className="flex items-center gap-3.5 text-sm text-on-navy">
            <span>Session {session.n} of {course.sessions.length}</span>
            <span aria-hidden="true" className="flex gap-1">
              {course.sessions.map((s) => (
                <span key={s.n} className={cn('h-1 w-7 rounded-sm', s.n <= session.n ? 'bg-white' : 'bg-white/30')} />
              ))}
            </span>
          </div>
        </Container>
      </section>

      <Container className="flex flex-wrap items-start gap-x-12 gap-y-10 pt-10 pb-20 sm:pb-28">
        {/* Outline — after the content on narrow screens */}
        <nav aria-label="Course outline" className="order-2 min-w-0 flex-[1_1_280px] lg:order-none lg:sticky lg:top-[100px] lg:flex-[0_1_280px]">
          <h2 className="mb-3 text-[13px] font-semibold tracking-[0.02em] text-text-tertiary">COURSE OUTLINE</h2>
          <ol className="flex flex-col gap-1">
            {course.sessions.map((s) => {
              const isCurrent = s.n === session.n
              return (
                <li key={s.n}>
                  <Link
                    href={`/education/${course.slug}/session/${s.n}`}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={cn('flex gap-3 rounded-lg px-3.5 py-3 transition-colors', isCurrent ? 'bg-paper text-white' : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary')}
                  >
                    <span className={cn('pt-0.5 font-mono text-[13px]', isCurrent ? 'text-link' : 'text-text-disabled')}>{String(s.n).padStart(2, '0')}</span>
                    <span className={cn('text-[15px] leading-snug', isCurrent ? 'font-bold' : 'font-medium')}>{s.title}</span>
                  </Link>
                  {isCurrent && (
                    <ul className="mb-2 ml-10 mt-1 flex flex-col gap-0.5 text-sm">
                      {available.map((t) => (
                        <li key={t.id}>
                          <button type="button" onClick={() => setTab(t.id)} className={cn('py-1.5 text-left', tab === t.id ? 'font-semibold text-white' : 'text-text-tertiary hover:text-text-primary')}>
                            {t.label}
                          </button>
                        </li>
                      ))}
                      {s.materials.notebook && (
                        <li>
                          <a href={s.materials.notebook} target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 text-text-tertiary hover:text-text-primary">
                            Notebook ↗
                          </a>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        <main className="order-1 min-w-0 flex-[1_1_640px] lg:order-none">
          <p className="mb-1.5 font-mono text-sm text-link">
            Session {String(session.n).padStart(2, '0')} · {session.date} 2026 · 90 min
          </p>
          <h1 className="mb-2 text-[28px] sm:text-[34px] lg:text-[40px] font-bold leading-[1.12] tracking-[-0.03em] text-text-primary">{session.title}</h1>
          <p className="mb-7 text-lg text-text-secondary">{session.goal}</p>

          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="Session materials" className="flex gap-1.5 rounded-lg bg-paper p-1">
              {available.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn('min-h-[38px] rounded-md px-4 text-[15px] font-medium transition-colors', tab === t.id ? 'bg-navy text-white' : 'text-text-secondary hover:text-text-primary')}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {openUrl && (
              <a href={openUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-link hover:text-text-primary">
                {current.open} ↗
              </a>
            )}
          </div>

          {tab === 'video' && session.materials.video ? (
            <VideoPlayer url={session.materials.video} title={`Session ${session.n} recording`} />
          ) : (
            embedUrl(tab, session) && (
              <div className={cn('relative overflow-hidden rounded-xl bg-paper', tab === 'slides' ? 'aspect-video' : 'h-[640px]')}>
                <iframe
                  key={tab}
                  src={embedUrl(tab, session)!}
                  title={`Session ${session.n} ${current.label.toLowerCase()}`}
                  loading="lazy"
                  allowFullScreen
                  className={cn('absolute inset-0 h-full w-full border-0', tab === 'notes' && 'bg-white')}
                />
              </div>
            )
          )}

          {session.materials.notebook && (
            <a
              href={session.materials.notebook}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-xl bg-paper px-6 py-[22px]"
            >
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-[10px] bg-navy font-mono text-[15px] text-white">{'{ }'}</span>
              <span className="min-w-0 flex-[1_1_320px]">
                <span className="block text-[13px] text-text-tertiary">Next step, after watching</span>
                <span className="block text-lg font-bold text-text-primary group-hover:text-link transition-colors">Do the practice notebook</span>
              </span>
              <span className="font-semibold text-link">Open in Colab ↗</span>
            </a>
          )}

          <h2 className="mb-[18px] mt-14 text-[22px] font-bold tracking-[-0.015em] text-text-primary">In this session</h2>
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {session.topicGroups.map((g) => (
              <div key={g.title}>
                <h3 className="mb-2 text-[15px] font-semibold text-link">{g.title}</h3>
                <ul className="border-b border-rule">
                  {g.items.map((item) => (
                    <li key={item} className="border-t border-rule py-2.5 text-[#C9CED8]">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <nav aria-label="Session navigation" className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {prev ? (
              <Link href={`/education/${course.slug}/session/${prev.n}`} className="group rounded-xl border border-[#2A2E37] px-[22px] py-5">
                <span className="block text-[13px] text-text-tertiary">← Previous · Session {String(prev.n).padStart(2, '0')}</span>
                <span className="block font-bold leading-snug text-text-primary group-hover:text-link transition-colors">{prev.title}</span>
              </Link>
            ) : (
              <Link href={`/education/${course.slug}`} className="group rounded-xl border border-[#2A2E37] px-[22px] py-5">
                <span className="block text-[13px] text-text-tertiary">← Back to</span>
                <span className="block font-bold leading-snug text-text-primary group-hover:text-link transition-colors">Course overview</span>
              </Link>
            )}
            {next ? (
              <Link href={`/education/${course.slug}/session/${next.n}`} className="group rounded-xl border border-[#4A6BA8] bg-navy/35 px-[22px] py-5 text-right">
                <span className="block text-[13px] text-text-secondary">Next · Session {String(next.n).padStart(2, '0')} →</span>
                <span className="block font-bold leading-snug text-text-primary group-hover:text-link transition-colors">{next.title}</span>
              </Link>
            ) : (
              <Link href="/contest" className="group rounded-xl border border-[#4A6BA8] bg-navy/35 px-[22px] py-5 text-right">
                <span className="block text-[13px] text-text-secondary">You finished the course →</span>
                <span className="block font-bold leading-snug text-text-primary group-hover:text-link transition-colors">Put it to use in a contest</span>
              </Link>
            )}
          </nav>
        </main>
      </Container>
    </div>
  )
}
