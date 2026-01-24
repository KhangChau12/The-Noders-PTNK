'use client'

import { useState } from 'react'
import { Card } from '@/components/Card'
import { Trophy, Medal, Award, Users, User } from 'lucide-react'
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

export function LeaderboardTabs({ teamLeaderboard, individualLeaderboard }: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'individual'>('team')
  const { lang } = useLanguage()
  const t = content[lang as keyof typeof content] || content.vi

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeTab === 'team'
              ? 'bg-gradient-to-r from-primary-blue to-accent-cyan text-white shadow-lg shadow-primary-blue/30'
              : 'bg-dark-surface/50 text-text-secondary hover:text-text-primary hover:bg-dark-surface border border-dark-border/50'
          }`}
        >
          <Users className="w-4 h-4" />
          {t.leaderboard_tabs.team_tab} ({teamLeaderboard.length})
        </button>
        <button
          onClick={() => setActiveTab('individual')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeTab === 'individual'
              ? 'bg-gradient-to-r from-primary-blue to-accent-cyan text-white shadow-lg shadow-primary-blue/30'
              : 'bg-dark-surface/50 text-text-secondary hover:text-text-primary hover:bg-dark-surface border border-dark-border/50'
          }`}
        >
          <User className="w-4 h-4" />
          {t.leaderboard_tabs.individual_tab} ({individualLeaderboard.length})
        </button>
      </div>

      {/* Team Leaderboard */}
      {activeTab === 'team' && (
        <Card className="overflow-hidden border-primary-blue/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary-blue/20 to-accent-cyan/20 border-b border-dark-border">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.rank}</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.team}</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.public}</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.private}</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.average}</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.submissions}</th>
                </tr>
              </thead>
              <tbody>
                {teamLeaderboard.map((entry, index) => (
                  <tr
                    key={entry.rank ?? `unranked-${index}`}
                    className={`border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors ${
                      entry.rank !== null && entry.rank <= 5 ? 'bg-gradient-to-r from-primary-blue/5 to-accent-cyan/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {entry.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                        {entry.rank === 3 && <Award className="w-5 h-5 text-amber-600" />}
                        <span className={`font-bold ${entry.rank !== null && entry.rank <= 3 ? 'text-primary-blue' : 'text-text-secondary'}`}>
                          {entry.rank !== null ? `#${entry.rank}` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${entry.rank !== null && entry.rank <= 5 ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {entry.team}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm text-text-secondary">
                      {entry.public?.toFixed(4) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm text-text-secondary">
                      {entry.private?.toFixed(4) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-mono text-sm font-semibold ${entry.average ? 'text-primary-blue' : 'text-text-tertiary'}`}>
                        {entry.average?.toFixed(4) ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-text-tertiary">
                      {entry.submissions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Individual Leaderboard */}
      {activeTab === 'individual' && (
        <Card className="overflow-hidden border-primary-blue/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary-blue/20 to-accent-cyan/20 border-b border-dark-border">
                  <th className="px-3 py-4 text-left text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.rank}</th>
                  <th className="px-3 py-4 text-left text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.name}</th>
                  <th className="px-3 py-4 text-left text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.team}</th>
                  <th className="px-3 py-4 text-center text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.public}</th>
                  <th className="px-3 py-4 text-center text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.private}</th>
                  <th className="px-3 py-4 text-center text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.average}</th>
                  <th className="px-3 py-4 text-center text-sm font-semibold text-text-primary">{t.leaderboard_tabs.columns.submissions}</th>
                </tr>
              </thead>
              <tbody>
                {individualLeaderboard.map((entry, index) => (
                  <tr
                    key={entry.rank ?? `unranked-${index}`}
                    className={`border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors ${
                      entry.rank !== null && entry.rank <= 5 ? 'bg-gradient-to-r from-primary-blue/5 to-accent-cyan/5' : ''
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        {entry.rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                        {entry.rank === 2 && <Medal className="w-4 h-4 text-gray-400" />}
                        {entry.rank === 3 && <Award className="w-4 h-4 text-amber-600" />}
                        <span className={`font-bold text-sm ${entry.rank !== null && entry.rank <= 3 ? 'text-primary-blue' : 'text-text-secondary'}`}>
                          {entry.rank !== null ? `#${entry.rank}` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`font-medium text-sm ${entry.rank !== null && entry.rank <= 5 ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {entry.name}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-text-tertiary">
                      {entry.team}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs text-text-secondary">
                      {entry.public?.toFixed(4) ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs text-text-secondary">
                      {entry.private?.toFixed(4) ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`font-mono text-xs font-semibold ${entry.average ? 'text-primary-blue' : 'text-text-tertiary'}`}>
                        {entry.average?.toFixed(4) ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-text-tertiary">
                      {entry.submissions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
