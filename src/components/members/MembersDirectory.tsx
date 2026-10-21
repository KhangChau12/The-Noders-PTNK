'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { FilterButton, SectionTitle } from '@/components/editorial'
import { cn } from '@/lib/utils'

export interface DirectoryMember {
  id: string
  name: string
  avatar: string | null
  products: number
  posts: number
  contests: number
  summary: string
}

const FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'build', label: 'Built products', test: (m: DirectoryMember) => m.products > 0 },
  { id: 'write', label: 'Wrote posts', test: (m: DirectoryMember) => m.posts > 0 },
  { id: 'compete', label: 'Competed', test: (m: DirectoryMember) => m.contests > 0 },
] as const

/** Everyone, filterable by what they've actually done. */
export function MembersDirectory({ members }: { members: DirectoryMember[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [sort, setSort] = useState<'active' | 'name'>('active')
  const [q, setQ] = useState('')

  const people = useMemo(() => {
    const test = FILTERS.find((f) => f.id === filter)!.test
    const needle = q.trim().toLowerCase()
    const score = (m: DirectoryMember) => m.products * 3 + m.posts + m.contests
    return members
      .filter(test)
      .filter((m) => !needle || m.name.toLowerCase().includes(needle))
      .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : score(b) - score(a) || a.name.localeCompare(b.name)))
  }, [members, filter, sort, q])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionTitle>Everyone</SectionTitle>
        <label className="block">
          <span className="sr-only">Search members</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name"
            className="min-h-[42px] w-[260px] max-w-full rounded-md border border-control bg-paper px-3 text-[15px] text-text-primary placeholder:text-[#6B7180] focus:border-text-tertiary focus:outline-none"
          />
        </label>
      </div>

      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <FilterButton key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label} <span className="font-mono text-xs opacity-75">{members.filter(f.test).length}</span>
            </FilterButton>
          ))}
        </div>
        <div role="group" aria-label="Sort" className="flex items-center gap-1 text-sm text-text-tertiary">
          Sort
          {(['active', 'name'] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={sort === s}
              onClick={() => setSort(s)}
              className={cn('p-2', sort === s ? 'font-semibold text-text-primary' : 'text-text-tertiary hover:text-text-primary')}
            >
              {s === 'active' ? 'Most active' : 'Name'}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((m) => (
          <li key={m.id}>
            <Link href={`/members/${m.id}`} className="group grid grid-cols-[48px_1fr] items-center gap-3.5 rounded-[10px] bg-[#111318] px-4 py-3.5 transition-colors hover:bg-[#1A1E26]">
              <Avatar src={m.avatar} name={m.name} size="md" className="h-12 w-12" />
              <span className="min-w-0">
                <span className="block truncate font-bold leading-snug text-text-primary group-hover:text-link transition-colors">{m.name}</span>
                <span className={cn('block truncate text-sm', m.summary ? 'text-text-tertiary' : 'text-text-disabled')}>
                  {m.summary || 'No public work yet'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {people.length === 0 && <p className="mt-2 text-text-secondary">Nobody matches. Try another name or filter.</p>}
    </div>
  )
}
