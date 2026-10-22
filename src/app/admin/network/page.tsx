'use client'

import { useMemo } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { NetworkGraph } from '@/components/NetworkGraph'
import { isAdvisorOnly } from '@/lib/terms'
import type { NetworkInput } from '@/lib/network'

/** Preview of the homepage network, shown to the core team first for feedback. */
export default function AdminNetworkPage() {
  const { data, ready } = useAdmin()
  const input = useMemo<NetworkInput>(
    () => ({
      members: data.members.filter((m) => !(data.terms.ready && isAdvisorOnly(data.terms, m.id))),
      products: data.products.filter((p) => p.status === 'active'),
      credits: data.credits,
      posts: data.posts,
      logs: data.logs,
      logMembers: data.logMembers,
    }),
    [data]
  )

  if (!ready) return <div aria-busy="true" className="h-[640px] animate-pulse rounded-xl bg-paper" />

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="min-w-0 flex-[1_1_560px]">
          <p className="mb-2 text-sm text-signal">Preview · not on the public site yet</p>
          <h2 className="mb-2 text-[28px] font-bold tracking-[-0.02em]">The network so far</h2>
          <p className="max-w-[680px] text-text-secondary">
            Every line is something that happened: a product someone built, a post they wrote, or an event they took part in (from club points). It updates on its own. Planned for the homepage — tell Khang what to change before it goes public.
          </p>
        </div>
      </div>
      <NetworkGraph input={input} />
    </>
  )
}
