'use client'

import { useState } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { btnSecondary, fieldClass } from '@/components/dashboard/ui'
import { createClient } from '@/lib/supabase'
import { formatMonth } from '@/lib/dashboard'
import { KIND_RANK, LEADING, departmentsOf, positionLabel, type Position, type Term } from '@/lib/terms'
import type { AdminMember } from '@/lib/admin'
import { cn } from '@/lib/utils'

/**
 * Which terms one person belongs to, and their role in each.
 * Values: '' (not in the term), 'member', 'vice_president', 'president', 'head:<departmentId>'.
 */
export function MemberTermsDialog({ member, onClose }: { member: AdminMember; onClose: () => void }) {
  const { data, refresh } = useAdmin()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [saving, setSaving] = useState<string | null>(null)
  const { terms } = data
  const db: any = createClient()

  const mine = (t: Term) =>
    terms.positions.filter((p) => p.term_id === t.id && p.profile_id === member.id && p.kind !== 'advisor').sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind])
  const valueOf = (p?: Position) => (!p ? '' : p.kind === 'head' ? `head:${p.department_id}` : p.kind)
  const isFounder = terms.positions.some((p) => p.kind === 'founder' && p.profile_id === member.id)
  const nameOf = (id: string | null) => data.members.find((m) => m.id === id)?.full_name || 'someone'

  const change = async (t: Term, value: string) => {
    const current = mine(t)
    const [kind, dept] = value.startsWith('head:') ? ['head', value.slice(5)] : [value, null]
    const wasLeading = current.some((p) => LEADING.includes(p.kind))
    const willLead = !!value && value !== 'member'

    // Only one President per term: the old one stays in the term as a Member
    const otherPresident = kind === 'president' ? terms.positions.find((p) => p.term_id === t.id && p.kind === 'president' && p.profile_id !== member.id) : undefined
    if (otherPresident) {
      const ok = await confirm({
        title: `Replace ${nameOf(otherPresident.profile_id)} as President of ${t.name}?`,
        message: `${nameOf(otherPresident.profile_id)} stays in ${t.name} as a Member.`,
        confirmText: 'Replace',
        variant: 'warning',
      })
      if (!ok) return
    }
    if (member.id === user?.id && t.is_current && wasLeading && !willLead && !isFounder) {
      const ok = await confirm({
        title: 'Remove your own admin access?',
        message: `Without a leadership role in ${t.name} you can no longer open this admin area.`,
        confirmText: 'Continue',
        variant: 'danger',
      })
      if (!ok) return
    }

    setSaving(t.id)
    try {
      if (otherPresident) {
        const { error } = await db.from('positions').update({ kind: 'member', sort: KIND_RANK.member }).eq('id', otherPresident.id)
        if (error) throw error
      }
      if (!value) {
        if (current.length) {
          const { error } = await db.from('positions').delete().in('id', current.map((p) => p.id))
          if (error) throw error
        }
      } else {
        const row = { kind, department_id: dept, sort: KIND_RANK[kind as Position['kind']] }
        if (current.length) {
          const { error } = await db.from('positions').update(row).eq('id', current[0].id)
          if (error) throw error
          if (current.length > 1) {
            const { error: e2 } = await db.from('positions').delete().in('id', current.slice(1).map((p) => p.id))
            if (e2) throw e2
          }
        } else {
          const { error } = await db.from('positions').insert({ ...row, term_id: t.id, profile_id: member.id })
          if (error) throw error
        }
      }
      if (t.is_current && (wasLeading || willLead || otherPresident)) {
        const { error } = await db.rpc('sync_admin_roles')
        if (error) throw error
      }
      await refresh()
      showToast('success', value ? `${member.full_name}: ${t.name} updated` : `${member.full_name} removed from ${t.name}`)
    } catch (e: any) {
      showToast('error', e.message || String(e))
      await refresh()
    } finally {
      setSaving(null)
    }
  }

  const range = (t: Term) => (t.starts_on ? `${formatMonth(t.starts_on)}${t.ends_on ? ` – ${formatMonth(t.ends_on)}` : t.is_current ? ' – now' : ''}` : '')

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[rgba(5,8,14,0.6)]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="mt-title" className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-48px)] w-[min(560px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[14px] border border-[#2A2E37] bg-paper p-[26px] shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
        <h2 id="mt-title" className="mb-1.5 text-xl font-bold">Terms for {member.full_name}</h2>
        <p className="mb-5 text-sm text-text-tertiary">
          Their role in each term. This is what the Members page and their profile show, and a leadership role in the current term gives admin access.
        </p>
        {isFounder && <p className="mb-3 rounded-lg bg-ink px-4 py-3 text-sm text-text-secondary">Founder — across all terms, always has admin access.</p>}
        <ul className="flex flex-col">
          {terms.terms.map((t) => {
            const value = valueOf(mine(t)[0])
            const advisor = terms.positions.find((p) => p.term_id === t.id && p.profile_id === member.id && p.kind === 'advisor')
            return (
              <li key={t.id} className="grid grid-cols-1 items-center gap-x-4 gap-y-1.5 border-t border-rule py-3.5 sm:grid-cols-[minmax(0,1fr)_240px]">
                <span className="min-w-0">
                  <span className="block font-semibold">
                    {t.name}
                    {t.is_current && <span className="ml-2 text-[13px] font-normal text-[#6FD39F]">current</span>}
                    {!t.is_current && t.number > (terms.terms.find((x) => x.is_current)?.number ?? Infinity) && <span className="ml-2 text-[13px] font-normal text-signal">not started</span>}
                  </span>
                  <span className="block text-[13px] text-text-tertiary">{[range(t), advisor && positionLabel(advisor, terms)].filter(Boolean).join(' · ')}</span>
                </span>
                <select
                  value={value}
                  disabled={saving === t.id}
                  onChange={(e) => change(t, e.target.value)}
                  aria-label={`Role in ${t.name}`}
                  className={cn(fieldClass, 'min-h-[40px] bg-ink text-sm', !value && 'text-text-tertiary', saving === t.id && 'opacity-60')}
                >
                  <option value="">Not in this term</option>
                  <option value="member">Member</option>
                  {departmentsOf(terms, t.id).map((d) => (
                    <option key={d.id} value={`head:${d.id}`}>Head of {d.name}</option>
                  ))}
                  <option value="vice_president">Vice President</option>
                  <option value="president">President</option>
                </select>
              </li>
            )
          })}
        </ul>
        {terms.terms.length === 0 && <p className="text-sm text-text-tertiary">No terms yet.</p>}
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onClose} className={btnSecondary}>Done</button>
        </div>
      </div>
    </>
  )
}
