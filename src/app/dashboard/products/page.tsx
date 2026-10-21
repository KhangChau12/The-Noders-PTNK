'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { Segments, btnPrimary, btnSecondary } from '@/components/dashboard/ui'
import { FilterButton } from '@/components/editorial'
import { DashProduct, doneCount, productChecklist } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'todo' | 'helping'

const FILTERS: { id: Filter; label: string; test: (p: DashProduct) => boolean }[] = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'todo', label: 'Needs work', test: (p) => doneCount(p) < 4 },
  { id: 'helping', label: 'Contributing', test: (p) => !p.isCreator },
]

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsList />
    </Suspense>
  )
}

function ProductsList() {
  const { data, ready } = useDashboard()
  const params = useSearchParams()
  const [filter, setFilter] = useState<Filter>(params.get('show') === 'todo' ? 'todo' : 'all')

  const products = data.products
  const complete = products.filter((p) => doneCount(p) === 4).length
  const rows = products.filter(FILTERS.find((f) => f.id === filter)!.test)

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
          <h2 className="text-[28px] font-bold tracking-[-0.02em]">Products</h2>
          {ready && products.length > 0 && (
            <span className="text-text-tertiary">
              {complete} complete{products.length - complete ? ` · ${products.length - complete} need something` : ''}
            </span>
          )}
        </div>
        {products.length > 0 && (
          <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <FilterButton key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label} <span className="font-mono text-xs opacity-75">{products.filter(f.test).length}</span>
              </FilterButton>
            ))}
          </div>
        )}
      </div>

      {!ready ? (
        <div aria-busy="true" className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,520px),1fr))]">
          {[0, 1].map((i) => (
            <div key={i} className="h-[230px] animate-pulse rounded-[14px] bg-paper" />
          ))}
        </div>
      ) : (
        <ul className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,520px),1fr))]">
          {rows.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
          {filter === 'all' && (
            <li>
              <Link
                href="/dashboard/products/new"
                className="flex h-full min-h-[200px] flex-col justify-center gap-1 rounded-[14px] border border-dashed border-control p-6 text-text-primary transition-colors hover:border-text-tertiary"
              >
                <span className="text-lg font-bold">+ Add a product</span>
                <span className="text-sm text-text-tertiary">
                  Built something with others? Add it once and credit everyone — it shows on each of their profiles.
                </span>
              </Link>
            </li>
          )}
        </ul>
      )}
      {ready && rows.length === 0 && filter !== 'all' && (
        <p className="mt-2 text-text-tertiary">{filter === 'todo' ? 'Every product page is complete.' : 'You aren’t credited on anyone else’s product yet.'}</p>
      )}
    </>
  )
}

function ProductCard({ product: p }: { product: DashProduct }) {
  const checks = productChecklist(p)
  const done = checks.filter((c) => c.done).length
  const full = done === 4
  const canEdit = true // creators, credited contributors and admins can edit (enforced by the API and RLS)
  return (
    <article className="flex h-full flex-wrap overflow-hidden rounded-[14px] bg-paper">
      <Link href={`/products/${p.id}`} className="relative block min-h-[180px] min-w-0 flex-[1_1_220px] bg-ink" aria-label={`View ${p.title}`}>
        {p.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[13px] text-text-disabled">No screenshot yet</span>
        )}
      </Link>
      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-3 px-[22px] py-5">
        <div>
          <h3 className="text-lg font-bold leading-snug">{p.title}</h3>
          <p className="mt-0.5 text-[13px] text-text-tertiary">
            {[p.isCreator ? 'Created by you' : p.role || 'Contributor', p.share != null ? `${p.share}%` : null, p.status === 'archived' ? 'Archived' : 'Live']
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div>
          <span className="flex items-center gap-2.5">
            <Segments done={done} />
            <span className={cn('whitespace-nowrap text-[13px]', full ? 'text-text-tertiary' : 'text-signal')}>{full ? 'Complete' : `${done} of 4`}</span>
          </span>
          <ul aria-label="Page checklist" className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[13px]">
            {checks.map((c) => (
              <li key={c.key} className={cn('flex gap-1.5', c.done ? 'text-text-tertiary' : 'text-signal')}>
                <span aria-hidden="true" className={c.done ? 'text-[#6FD39F]' : ''}>{c.done ? '✓' : '○'}</span>
                {c.label}
                <span className="sr-only">{c.done ? ' — done' : ' — missing'}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto flex items-center gap-2">
          {canEdit && (
            <Link href={`/dashboard/products/${p.id}/edit`} className={full ? btnSecondary : btnPrimary}>
              {full ? 'Edit' : 'Finish page'}
            </Link>
          )}
          <Link href={`/products/${p.id}`} className="px-2.5 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary">
            View page
          </Link>
        </div>
      </div>
    </article>
  )
}
