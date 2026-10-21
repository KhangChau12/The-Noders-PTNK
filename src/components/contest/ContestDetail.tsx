import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Contest, ResultRow } from '@/lib/programs'
import {
  Breadcrumb,
  Container,
  NavyFacts,
  NavyPrimaryLink,
  NavySecondaryLink,
  SectionTitle,
  VideoPlayer,
} from '@/components/editorial'
import { Leaderboard } from './Leaderboard'

const TONE: Record<string, string> = {
  muted: 'bg-control',
  workshop: 'bg-[#6B7180]',
  public: 'bg-[#5B7FD6]',
  private: 'bg-[#BD8532]',
}

/** Public→private dumbbell for two-round contests. Colours validated for the dark surface. */
function RaceChart({ teams }: { teams: ResultRow[] }) {
  const rows = teams.filter((t) => t.public != null && t.private != null).slice(0, 10)
  const inRange = rows.filter((r) => Math.max(r.public!, r.private!) <= 0.6)
  const outliers = rows.filter((r) => Math.max(r.public!, r.private!) > 0.6)
  const all = inRange.flatMap((r) => [r.public!, r.private!])
  const lo = Math.floor(Math.min(...all) * 50) / 50
  const hi = Math.ceil(Math.max(...all) * 50) / 50
  const pos = (v: number) => `${(((v - lo) / (hi - lo)) * 100).toFixed(2)}%`
  const ticks = Array.from({ length: 5 }, (_, i) => (lo + ((hi - lo) * i) / 4).toFixed(2))

  return (
    <figure className="m-0 rounded-xl bg-paper px-4 pb-6 pt-7 sm:px-9">
      <figcaption className="mb-5 flex flex-wrap justify-between gap-3">
        <span className="font-semibold text-text-primary">Public vs private MAE · top {inRange.length} teams</span>
        <span className="flex gap-5 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#5B7FD6]" />Public round</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#BD8532]" />Private round</span>
        </span>
      </figcaption>

      <table className="w-full border-collapse">
        <caption className="sr-only">Public and private MAE for each team, and how much it changed</caption>
        <thead className="sr-only">
          <tr><th scope="col">Team</th><th scope="col">Public → private</th><th scope="col">Change</th></tr>
        </thead>
        <tbody>
          {inRange.map((r, i) => {
            const a = Math.min(r.public!, r.private!)
            const b = Math.max(r.public!, r.private!)
            const delta = r.private! - r.public!
            return (
              <tr key={r.name} title={`${r.name}: public ${r.public!.toFixed(4)} → private ${r.private!.toFixed(4)}`} className="hover:bg-white/[0.03]">
                <th scope="row" className={cn('w-[34%] max-w-0 truncate py-[7px] pr-4 text-left text-sm sm:w-[200px]', i === 0 ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                  {String(i + 1).padStart(2, '0')} {r.name}
                </th>
                <td className="py-[7px]">
                  <span className="relative block h-[18px]">
                    <span className="absolute top-2 h-0.5 bg-[#4A5060]" style={{ left: pos(a), width: `calc(${pos(b)} - ${pos(a)})` }} />
                    <span className="absolute top-[3px] -ml-1.5 h-3 w-3 rounded-full bg-[#5B7FD6] ring-2 ring-paper" style={{ left: pos(r.public!) }}>
                      <span className="sr-only">{r.public!.toFixed(4)}</span>
                    </span>
                    <span className="absolute top-[3px] -ml-1.5 h-3 w-3 rounded-full bg-[#BD8532] ring-2 ring-paper" style={{ left: pos(r.private!) }}>
                      <span className="sr-only">{r.private!.toFixed(4)}</span>
                    </span>
                  </span>
                </td>
                <td className="w-[70px] py-[7px] pl-4 text-right font-mono text-[13px] text-text-secondary">
                  {delta >= 0 ? '+' : '−'}{Math.abs(delta).toFixed(3)}
                </td>
              </tr>
            )
          })}
          <tr aria-hidden="true">
            <td />
            <td className="border-t border-[#2A2E37] pt-2">
              <span className="flex justify-between font-mono text-xs text-[#6B7180]">{ticks.map((t) => <span key={t}>{t}</span>)}</span>
            </td>
            <td className="border-t border-[#2A2E37] pt-2 text-right font-mono text-xs text-[#6B7180]">change</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3.5 text-[13px] text-[#6B7180]">
        Lower is better.
        {outliers.map((o) => ` ${o.name} (${o.public!.toFixed(3)} → ${o.private!.toFixed(3)}) is off the scale and not shown.`)}
      </p>
    </figure>
  )
}

export function ContestDetail({ contest }: { contest: Contest }) {
  const twoRounds = contest.results.individuals.some((r) => r.private != null)
  const totalSpan = contest.timeline.reduce((s, p) => s + p.span, 0)

  const sections = [
    { id: 'problem', label: 'The problem' },
    { id: 'race', label: twoRounds ? 'How it played out' : 'How it ran' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'rules', label: 'Rules & prizes' },
    { id: 'resources', label: 'Resources' },
  ]

  return (
    <div>
      {/* Navy intro: the contest is over, so "who won?" leads */}
      <section className="bg-navy text-white">
        <Container className="pt-11">
          <Breadcrumb items={[{ label: 'Contests', href: '/contest' }, { label: contest.shortName }]} />
          <div className="flex flex-wrap items-stretch gap-x-[72px] gap-y-10">
            <div className="flex min-w-0 flex-[1_1_480px] flex-col">
              <p className="mb-3.5 text-[15px] text-on-navy">
                {contest.kind} contest · {contest.status === 'ended' ? `Ended ${contest.endedOn}` : contest.status === 'open' ? 'Open now' : 'Coming up'}
              </p>
              <h1 className="mb-[18px] text-[34px] sm:text-[44px] lg:text-[56px] font-bold leading-[1.04] tracking-[-0.035em]">{contest.title}</h1>
              <p className="mb-7 max-w-[540px] text-lg text-on-navy">{contest.pitch}</p>
              <div className="mt-auto flex flex-wrap gap-3">
                <NavyPrimaryLink href="#problem">Read the problem</NavyPrimaryLink>
                <NavySecondaryLink href="#leaderboard">Find {contest.results.teams ? 'your team' : 'your name'}</NavySecondaryLink>
              </div>
            </div>

            <ol aria-label="Winners" className="flex min-w-0 flex-[0_1_460px] flex-col gap-2.5">
              {contest.winners.map((w, i) => (
                <li
                  key={w.place}
                  className={cn(
                    'flex items-center gap-[18px] rounded-[10px] px-5',
                    i === 0 ? 'bg-white/[0.08] py-[18px]' : 'border border-white/[0.18] py-3.5'
                  )}
                >
                  <span className={cn('w-11 font-mono leading-none', i === 0 ? 'text-[34px] font-medium' : 'text-2xl text-on-navy')}>{w.place}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block font-bold leading-tight', i === 0 ? 'text-[22px]' : 'text-[17px]')}>{w.name}</span>
                    <span className={cn('block text-on-navy', i === 0 ? 'text-sm' : 'text-[13px]')}>{w.note}</span>
                  </span>
                  {w.score && (
                    <span className="text-right">
                      <span className={cn('block font-mono', i === 0 ? 'text-lg' : 'text-[15px]')}>{w.score}</span>
                      {i === 0 && <span className="block text-xs text-on-navy">{twoRounds ? 'avg MAE' : 'MAE'}</span>}
                    </span>
                  )}
                </li>
              ))}
              {contest.extraAwards && <li className="px-1 pt-1.5 text-sm text-on-navy">{contest.extraAwards}</li>}
            </ol>
          </div>
          <NavyFacts facts={contest.facts} className="mt-11" />
        </Container>
      </section>

      {/* In-page nav, sits under the glass header */}
      <div className="sticky top-[69px] z-30 border-b border-rule bg-ink/[0.92] backdrop-blur-[10px]">
        <Container>
          <nav aria-label="On this page" className="no-scrollbar flex gap-7 overflow-x-auto text-[15px] font-medium">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="whitespace-nowrap py-[15px] text-text-secondary transition-colors hover:text-white">
                {s.label}
              </a>
            ))}
          </nav>
        </Container>
      </div>

      {/* The problem */}
      <section id="problem" className="scroll-mt-32 pt-20">
        <Container className="flex flex-wrap items-start gap-x-[72px] gap-y-10">
          <div className="min-w-0 flex-[1_1_480px]">
            <SectionTitle className="mb-[18px]">The problem</SectionTitle>
            <p className="mb-[18px] text-lg leading-[1.7] text-[#C9CED8]">{contest.problem.summary}</p>
            <p className="mb-7 text-[17px] leading-[1.7] text-text-secondary">{contest.problem.why}</p>
            <h3 className="mb-2.5 text-[15px] font-semibold text-text-primary">Each training row contains</h3>
            <ul className="border-b border-rule text-[15px]">
              {contest.problem.fields.map((f) => (
                <li key={f.name} className="flex gap-6 border-t border-rule py-[11px]">
                  <span className="flex-[0_0_170px] font-mono text-link">{f.name}</span>
                  <span className="text-text-secondary">{f.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="flex min-w-0 flex-[0_1_440px] flex-col gap-[22px] rounded-xl bg-paper p-7">
            <div>
              <dt className="mb-1 text-[13px] text-text-tertiary">Input</dt>
              <dd className="text-text-primary">{contest.problem.input}</dd>
            </div>
            <div>
              <dt className="mb-1 text-[13px] text-text-tertiary">Output</dt>
              <dd className="text-text-primary">{contest.problem.output}</dd>
            </div>
            <div>
              <dt className="mb-2 text-[13px] text-text-tertiary">Metric — mean absolute error, lower is better</dt>
              <dd className="rounded-lg bg-ink px-4 py-3.5 font-mono text-lg text-text-primary">MAE = ¹⁄ₙ Σ |ŷᵢ − yᵢ|</dd>
              <dd className="mt-2.5 text-sm text-text-secondary">
                An MAE of {contest.winners[0].score ?? '0.4'} means the model was, on average, less than half a band away from the examiner.
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-[13px] text-text-tertiary">Submission</dt>
              <dd className="text-text-primary">{contest.problem.submission}</dd>
            </div>
          </dl>
        </Container>
      </section>

      {/* How it played out */}
      <section id="race" className="scroll-mt-32 pt-[104px]">
        <Container>
          <SectionTitle className="mb-2.5">{twoRounds ? 'How it played out' : 'How it ran'}</SectionTitle>
          {contest.raceTakeaway && <p className="mb-8 max-w-[760px] text-[17px] text-text-secondary">{contest.raceTakeaway}</p>}

          <ol
            className={cn('grid gap-1 text-[13px]', twoRounds ? 'mb-10' : 'mt-8')}
            style={{ gridTemplateColumns: contest.timeline.map((p) => `${(p.span / totalSpan) * 100}fr`).join(' ') }}
          >
            {contest.timeline.map((p) => (
              <li key={p.label} className="min-w-0">
                <div className={cn('h-1.5 rounded-[3px]', TONE[p.tone])} />
                <div className="mt-2 truncate text-text-secondary" title={`${p.label} · ${p.dates}`}>
                  {p.label} · {p.dates}
                </div>
              </li>
            ))}
          </ol>

          {twoRounds && contest.results.teams && <RaceChart teams={contest.results.teams} />}
        </Container>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="scroll-mt-32 pt-[104px]">
        <Container>
          <Leaderboard
            teams={contest.results.teams}
            individuals={contest.results.individuals}
            twoRounds={twoRounds}
            rankedBy={contest.results.rankedBy}
            note={contest.results.note}
            platformUrl={contest.platformUrl}
          />
        </Container>
      </section>

      {/* Rules & prizes */}
      <section id="rules" className="scroll-mt-32 pt-[104px]">
        <Container className="flex flex-wrap gap-x-[72px] gap-y-12">
          <div className="min-w-0 flex-[1_1_460px]">
            <SectionTitle className="mb-[18px] !text-[26px] sm:!text-[34px]">Rules</SectionTitle>
            <ul className="border-b border-rule">
              {contest.rules.map((r) => (
                <li key={r} className="border-t border-rule py-3.5 text-[#C9CED8]">{r}</li>
              ))}
            </ul>
          </div>
          <div className="min-w-0 flex-[1_1_400px]">
            <div className="mb-[18px] flex items-baseline justify-between">
              <SectionTitle className="!text-[26px] sm:!text-[34px]">Prizes</SectionTitle>
              {contest.prizeTotal && <span className="font-mono text-text-secondary">{contest.prizeTotal}</span>}
            </div>
            <table className="w-full border-collapse text-[15px]">
              <tbody>
                {contest.prizes.map((p) => (
                  <tr key={p.award} className="border-t border-rule last:border-b">
                    <td className="py-3.5 text-text-primary">{p.award}</td>
                    <td className="py-3.5 text-right font-mono text-text-primary">{p.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Resources */}
      <section id="resources" className="scroll-mt-32 pt-[104px] pb-20 sm:pb-28">
        <Container>
          <SectionTitle className="mb-6 !text-[26px] sm:!text-[34px]">Try it yourself</SectionTitle>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col overflow-hidden rounded-xl bg-paper">
              <VideoPlayer url={contest.video.url} title={contest.video.label} className="rounded-none" />
              <span className="px-5 py-4">
                <span className="block font-semibold text-text-primary">{contest.video.label}</span>
                <span className="block text-sm text-text-tertiary">Plays here, or open on YouTube</span>
              </span>
            </div>
            {[
              { href: contest.datasetUrl, kicker: 'dataset/', title: 'Download the dataset', foot: 'Google Drive ↗', external: true },
              { href: contest.platformUrl, kicker: 'practice', title: 'Submit after the contest', foot: 'Practice on the platform ↗', external: true },
              ...(contest.postSlug
                ? [{ href: `/posts/${contest.postSlug}`, kicker: 'story', title: contest.postLabel, foot: 'Read it →', external: false }]
                : []),
            ].map((c) => (
              <Link
                key={c.kicker}
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex flex-col gap-1.5 rounded-xl bg-paper px-5 py-[22px] transition-colors hover:bg-[#1A1E26]"
              >
                <span className="font-mono text-[13px] text-link">{c.kicker}</span>
                <span className="text-lg font-semibold text-text-primary group-hover:text-link transition-colors">{c.title}</span>
                <span className="mt-auto pt-6 text-sm text-text-tertiary">{c.foot}</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  )
}
