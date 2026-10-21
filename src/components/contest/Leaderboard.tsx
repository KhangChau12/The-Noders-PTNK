'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { FilterButton } from '@/components/editorial'
import type { ResultRow } from '@/lib/programs'

const fmt = (v: number | null) => (v == null ? '—' : v.toFixed(4))

/** Final leaderboard with Teams / Individuals tabs and a name search. */
export function Leaderboard({
  teams,
  individuals,
  twoRounds,
  rankedBy,
  note,
  platformUrl,
}: {
  teams?: ResultRow[]
  individuals: ResultRow[]
  twoRounds: boolean
  rankedBy: string
  note: string
  platformUrl: string
}) {
  const [tab, setTab] = useState<'team' | 'indiv'>(teams ? 'team' : 'indiv')
  const [q, setQ] = useState('')
  const isIndiv = tab === 'indiv'
  const source = isIndiv ? individuals : teams ?? []

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return source
      .map((r, i) => ({ ...r, rank: i + 1 }))
      .filter((r) => !needle || r.name.toLowerCase().includes(needle) || (r.team ?? '').toLowerCase().includes(needle))
  }, [source, q])

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="mb-1.5 text-[28px] sm:text-[34px] lg:text-[40px] font-bold leading-[1.15] tracking-[-0.025em] text-text-primary">
            Final leaderboard
          </h2>
          <p className="text-text-secondary">{rankedBy}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="relative block">
            <span className="sr-only">Search the leaderboard</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isIndiv ? 'Search a name or team' : 'Search a team'}
              className="min-h-[40px] w-[240px] max-w-full rounded-md border border-control bg-paper px-3 text-sm text-text-primary placeholder:text-[#6B7180] focus:border-text-tertiary focus:outline-none"
            />
          </label>
          {teams && (
            <div role="group" aria-label="Ranking" className="flex gap-2">
              <FilterButton active={!isIndiv} onClick={() => setTab('team')}>Teams</FilterButton>
              <FilterButton active={isIndiv} onClick={() => setTab('indiv')}>Individuals</FilterButton>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-paper px-4 pb-[18px] pt-1 sm:px-6 lg:px-8">
        <table className="w-full min-w-[620px] border-collapse text-[15px]">
          <thead>
            <tr className="text-left text-[13px] text-text-tertiary">
              <th scope="col" className="w-12 py-3.5 font-medium">#</th>
              <th scope="col" className="py-3.5 font-medium">{isIndiv ? 'Name · team' : 'Team'}</th>
              {twoRounds && <th scope="col" className="py-3.5 text-right font-medium">Public</th>}
              {twoRounds && <th scope="col" className="py-3.5 text-right font-medium">Private</th>}
              <th scope="col" className="py-3.5 text-right font-medium">{twoRounds ? 'Average' : 'MAE'}</th>
              <th scope="col" className="py-3.5 text-right font-medium">Subs</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.name}-${r.rank}`} className="border-t border-[#2A2E37]">
                <td className={cn('py-[11px] font-mono', r.rank <= 3 ? 'text-link' : 'text-text-tertiary')}>
                  {String(r.rank).padStart(2, '0')}
                </td>
                <td className="py-[11px]">
                  <span className="font-semibold text-text-primary">{r.name}</span>
                  {isIndiv && r.team && <span className="ml-2 text-sm text-text-tertiary">{r.team}</span>}
                </td>
                {twoRounds && <td className="py-[11px] text-right font-mono text-text-secondary">{fmt(r.public)}</td>}
                {twoRounds && <td className="py-[11px] text-right font-mono text-text-secondary">{fmt(r.private)}</td>}
                <td className="py-[11px] text-right font-mono text-text-primary">{fmt(r.score)}</td>
                <td className="py-[11px] text-right font-mono text-text-tertiary">{r.submissions}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="mt-4 text-text-secondary">No match on this board.</p>}
        <p className="mt-3.5 text-sm text-text-tertiary">
          {note}{' '}
          <a href={platformUrl} target="_blank" rel="noopener noreferrer" className="text-link hover:text-text-primary">
            Full board, all phases ↗
          </a>
        </p>
      </div>
    </div>
  )
}
