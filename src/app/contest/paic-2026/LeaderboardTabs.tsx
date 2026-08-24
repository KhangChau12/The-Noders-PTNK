'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/LanguageProvider'
import { content } from './locale'

interface TeamEntry {
  rank: number | null
  team: string
  public: number | null
  private: number | null
  average: number | null
  submissions: number
}

interface IndividualEntry {
  rank: number | null
  name: string
  team: string
  public: number | null
  private: number | null
  average: number | null
  submissions: number
}

interface LeaderboardTabsProps {
  teamLeaderboard: TeamEntry[]
  individualLeaderboard: IndividualEntry[]
}

function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) {
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold bg-dark-bg/60 text-text-tertiary">—</span>
  }
  const rankStyle =
    rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
    rank === 2 ? 'bg-slate-400/20 text-slate-300' :
    rank === 3 ? 'bg-amber-600/20 text-amber-500' :
    'bg-dark-bg/60 text-text-tertiary'
  return <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold', rankStyle)}>{rank}</span>
}

export function LeaderboardTabs({ teamLeaderboard, individualLeaderboard }: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'individual'>('team')
  const { lang } = useLanguage()
  const t = content[lang as keyof typeof content] || content.vi

  const rowHighlight = (rank: number | null) => {
    if (rank === 1) return 'bg-yellow-500/[0.04]'
    if (rank === 2) return 'bg-slate-400/[0.04]'
    if (rank === 3) return 'bg-amber-600/[0.03]'
    return ''
  }

  return (
    <div>
      {/* Tab Buttons — small pills, consistent with the rest of the site's tab pattern */}
      <div className="flex gap-1.5 mb-4">
        <button
          onClick={() => setActiveTab('team')}
          className={cn(
            'text-xs font-bold px-3.5 py-2 rounded-lg border transition-colors',
            activeTab === 'team'
              ? 'bg-primary-blue border-primary-blue text-white'
              : 'bg-dark-surface border-dark-border/60 text-text-secondary hover:text-text-primary'
          )}
        >
          {t.leaderboard_tabs.team_tab} ({teamLeaderboard.length})
        </button>
        <button
          onClick={() => setActiveTab('individual')}
          className={cn(
            'text-xs font-bold px-3.5 py-2 rounded-lg border transition-colors',
            activeTab === 'individual'
              ? 'bg-primary-blue border-primary-blue text-white'
              : 'bg-dark-surface border-dark-border/60 text-text-secondary hover:text-text-primary'
          )}
        >
          {t.leaderboard_tabs.individual_tab} ({individualLeaderboard.length})
        </button>
      </div>

      <div className="rounded-2xl border border-dark-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'team' ? (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="bg-dark-surface">
                  <th className="px-4 py-3 text-left text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.rank}</th>
                  <th className="px-4 py-3 text-left text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.team}</th>
                  <th className="px-4 py-3 text-right text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.public}</th>
                  <th className="px-4 py-3 text-right text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.private}</th>
                  <th className="px-4 py-3 text-right text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.average}</th>
                  <th className="px-4 py-3 text-right text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.submissions}</th>
                </tr>
              </thead>
              <tbody>
                {teamLeaderboard.map((entry, index) => (
                  <tr key={entry.rank ?? `unranked-${index}`} className={cn('border-t border-dark-border/60', rowHighlight(entry.rank))}>
                    <td className="px-4 py-2.5"><RankBadge rank={entry.rank} /></td>
                    <td className="px-4 py-2.5 font-bold text-text-primary whitespace-nowrap">{entry.team}</td>
                    <td className="px-4 py-2.5 text-right text-text-secondary [font-variant-numeric:tabular-nums]">{entry.public?.toFixed(4) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right text-text-secondary [font-variant-numeric:tabular-nums]">{entry.private?.toFixed(4) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-text-primary [font-variant-numeric:tabular-nums]">{entry.average?.toFixed(4) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right text-text-tertiary [font-variant-numeric:tabular-nums]">{entry.submissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="bg-dark-surface">
                  <th className="px-4 py-3 text-left text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.rank}</th>
                  <th className="px-4 py-3 text-left text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.name}</th>
                  <th className="px-4 py-3 text-left text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.team}</th>
                  <th className="px-4 py-3 text-right text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.public}</th>
                  <th className="px-4 py-3 text-right text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.private}</th>
                  <th className="px-4 py-3 text-right text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.average}</th>
                  <th className="px-4 py-3 text-right text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{t.leaderboard_tabs.columns.submissions}</th>
                </tr>
              </thead>
              <tbody>
                {individualLeaderboard.map((entry, index) => (
                  <tr key={entry.rank ?? `unranked-${index}`} className={cn('border-t border-dark-border/60', rowHighlight(entry.rank))}>
                    <td className="px-4 py-2.5"><RankBadge rank={entry.rank} /></td>
                    <td className="px-4 py-2.5 font-bold text-text-primary whitespace-nowrap">{entry.name}</td>
                    <td className="px-4 py-2.5 text-text-tertiary whitespace-nowrap">{entry.team}</td>
                    <td className="px-4 py-2.5 text-right text-text-secondary [font-variant-numeric:tabular-nums]">{entry.public?.toFixed(4) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right text-text-secondary [font-variant-numeric:tabular-nums]">{entry.private?.toFixed(4) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-text-primary [font-variant-numeric:tabular-nums]">{entry.average?.toFixed(4) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right text-text-tertiary [font-variant-numeric:tabular-nums]">{entry.submissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p className="lg:hidden text-xs text-text-tertiary text-center mt-3">
        {lang === 'vi' ? '← Vuốt ngang để xem đầy đủ bảng →' : '← Swipe to see full table →'}
      </p>
    </div>
  )
}
