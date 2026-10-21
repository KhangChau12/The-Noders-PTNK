'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'
import { FilterButton } from '@/components/editorial'
import { Segments } from '@/components/dashboard/ui'
import { AdminProduct, hasWriteup, nameOf, productGaps } from '@/lib/admin'
import { projectQueries } from '@/lib/queries'
import { formatMonth } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

const SLOTS = 3
type Filter = 'all' | 'incomplete' | 'featured'

export default function ProductsAdminPage() {
  return (
    <Suspense>
      <ProductsAdmin />
    </Suspense>
  )
}

function ProductsAdmin() {
  const { data, ready, patch } = useAdmin()
  const { session } = useAuth()
  const { showToast } = useToast()
  const params = useSearchParams()
  const [filter, setFilter] = useState<Filter>(params.get('show') === 'incomplete' ? 'incomplete' : 'all')
  const [busy, setBusy] = useState<string | null>(null)

  const featured = data.products.filter((p) => p.featured)
  const full = featured.length >= SLOTS
  const credits = (id: string) => data.credits.filter((c) => c.project_id === id).length

  const save = async (p: AdminProduct, changes: Partial<Pick<AdminProduct, 'featured' | 'status'>>, okMsg: string) => {
    setBusy(p.id)
    patch((d) => ({ ...d, products: d.products.map((x) => (x.id === p.id ? { ...x, ...changes } : x)) }))
    const { error } = await projectQueries.updateProject(p.id, changes, session)
    setBusy(null)
    if (error) {
      patch((d) => ({ ...d, products: d.products.map((x) => (x.id === p.id ? p : x)) }))
      showToast('error', /featured/i.test(error.message) ? `Only ${SLOTS} products can be on the homepage.` : error.message)
    } else showToast('success', okMsg)
  }

  const FILTERS: { id: Filter; label: string; test: (p: AdminProduct) => boolean }[] = [
    { id: 'all', label: 'All', test: () => true },
    { id: 'incomplete', label: 'Incomplete', test: (p) => productGaps(p).some((g) => !g.ok) },
    { id: 'featured', label: 'Featured', test: (p) => p.featured },
  ]
  const rows = data.products.filter(FILTERS.find((f) => f.id === filter)!.test)

  if (!ready) return <div aria-busy="true" className="h-[480px] animate-pulse rounded-xl bg-paper" />

  return (
    <>
      <section aria-labelledby="slots" className="mb-10">
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
          <h2 id="slots" className="text-[22px] font-bold tracking-[-0.01em]">On the homepage</h2>
          <span className="text-sm text-text-tertiary">
            {full ? `${SLOTS} of ${SLOTS} slots used · remove one to feature another` : `${SLOTS - featured.length} slot${SLOTS - featured.length > 1 ? 's' : ''} free`}
          </span>
        </div>
        <ol className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
          {Array.from({ length: SLOTS }, (_, i) => {
            const p = featured[i]
            if (!p) {
              return (
                <li key={i} className="flex min-h-[220px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-control p-5 text-center">
                  <span className="font-mono text-xs text-text-disabled">Slot {i + 1}</span>
                  <span className="font-semibold">Empty</span>
                  <span className="text-[13px] text-text-tertiary">Use “Feature” on a product with a write-up below.</span>
                </li>
              )
            }
            const empty = !hasWriteup(p)
            return (
              <li key={p.id} className={cn('overflow-hidden rounded-xl border bg-paper', empty ? 'border-[#6B2A2A]' : 'border-rule')}>
                <div className="relative">
                  {p.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnail} alt="" className="block aspect-video w-full object-cover" />
                  ) : (
                    <span className="flex aspect-video w-full items-center justify-center bg-ink text-[13px] text-text-disabled">No screenshot</span>
                  )}
                  <span className="absolute left-2.5 top-2.5 rounded bg-ink/80 px-1.5 py-0.5 font-mono text-xs">{i + 1}</span>
                </div>
                <div className="flex flex-col gap-1.5 px-4 py-3.5">
                  <Link href={`/products/${p.id}`} className="font-bold hover:text-link">{p.title}</Link>
                  <span className={cn('text-[13px]', empty ? 'text-[#FF9C85]' : 'text-text-tertiary')}>
                    {empty ? 'No write-up — the page behind this card is empty' : p.video_url ? 'Complete' : 'Complete enough to feature · no video'}
                  </span>
                  <button type="button" disabled={busy === p.id} onClick={() => save(p, { featured: false }, `${p.title} removed from the homepage`)} className="mt-1 self-start text-sm font-semibold text-text-tertiary hover:text-text-primary">
                    Remove from homepage
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section aria-labelledby="all">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h2 id="all" className="text-[22px] font-bold tracking-[-0.01em]">
            All products <span className="font-mono text-[15px] font-normal text-text-tertiary">{data.products.length}</span>
          </h2>
          <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <FilterButton key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label} <span className="font-mono text-xs opacity-75">{data.products.filter(f.test).length}</span>
              </FilterButton>
            ))}
          </div>
        </div>
        <ul>
          {rows.map((p) => {
            const gaps = productGaps(p)
            const done = gaps.filter((g) => g.ok).length
            const missing = gaps.filter((g) => !g.ok).map((g) => g.key)
            const live = p.status === 'active'
            const canFeature = hasWriteup(p) && !!p.thumbnail && live
            const featureTip = p.featured ? 'Remove from homepage' : !canFeature ? (live ? 'Needs a write-up and a screenshot first' : 'Archived products can’t be featured') : full ? `All ${SLOTS} slots are taken — remove one above` : 'Show on the homepage'
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-x-[18px] gap-y-3 border-t border-rule px-2 py-3 hover:bg-[#12151B] lg:grid lg:grid-cols-[112px_minmax(0,1fr)_210px_110px_190px]">
                {p.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumbnail} alt="" className="aspect-[16/10] w-[112px] rounded-md object-cover" />
                ) : (
                  <span className="flex aspect-[16/10] w-[112px] items-center justify-center rounded-md bg-paper text-[11px] text-text-disabled">No screenshot</span>
                )}
                <span className="min-w-0 flex-[1_1_220px]">
                  <Link href={`/dashboard/products/${p.id}/edit`} className="block font-bold text-text-primary hover:text-link">{p.title}</Link>
                  <span className="text-[13px] text-text-tertiary">
                    {nameOf(data, p.created_by)} · {credits(p.id)} credit{credits(p.id) === 1 ? '' : 's'} · added {formatMonth(p.created_at)}
                  </span>
                </span>
                <span className="min-w-[180px]">
                  <span className="flex items-center gap-2">
                    <Segments done={done} />
                    <span className={cn('whitespace-nowrap text-[13px]', done === 4 ? 'text-text-tertiary' : 'text-signal')}>{done === 4 ? 'Complete' : `${done} of 4`}</span>
                  </span>
                  {missing.length > 0 && <span className="mt-0.5 block text-xs text-signal">No {missing.join(', no ')}</span>}
                </span>
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => save(p, live ? { status: 'archived', featured: false } : { status: 'active' }, live ? `${p.title} archived` : `${p.title} is live again`)}
                  className={cn('justify-self-start rounded-full border px-2.5 py-1 text-[13px]', live ? 'border-[#2E5C45] text-[#6FD39F]' : 'border-control text-text-tertiary')}
                  title={live ? 'Archive (hide from the Products page)' : 'Make live again'}
                >
                  {live ? '● Live' : 'Archived'}
                </button>
                <span className="ml-auto flex items-center justify-end gap-1.5 lg:ml-0">
                  <button
                    type="button"
                    disabled={busy === p.id || (!p.featured && (!canFeature || full))}
                    onClick={() => save(p, { featured: !p.featured }, p.featured ? `${p.title} removed from the homepage` : `${p.title} is on the homepage`)}
                    title={featureTip}
                    className={cn(
                      'min-h-[34px] rounded-md border px-3 text-sm font-semibold disabled:cursor-not-allowed',
                      p.featured ? 'border-[#4A6BA8] bg-navy text-white' : 'border-control text-text-primary disabled:text-text-disabled'
                    )}
                  >
                    {p.featured ? '★ Featured' : 'Feature'}
                  </button>
                  <Link href={`/dashboard/products/${p.id}/edit`} className="px-2 py-1.5 text-sm font-semibold text-text-secondary hover:text-text-primary">Edit</Link>
                </span>
              </li>
            )
          })}
        </ul>
        <p className="mt-3.5 text-[13px] text-text-disabled">Only live products with a write-up and a screenshot can be featured. Delete a product from its editor.</p>
      </section>
    </>
  )
}
