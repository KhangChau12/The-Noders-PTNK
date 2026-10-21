'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { btnPrimary, btnSecondary, fieldClass, labelClass } from '@/components/dashboard/ui'
import { createClient } from '@/lib/supabase'
import { uploadImage } from '@/lib/upload'
import { currentTerm, departmentsOf } from '@/lib/terms'
import { cn } from '@/lib/utils'

interface Dept {
  key: string
  name: string
  was: string | null
}

export default function NewTermPage() {
  const { data, ready, refresh } = useAdmin()
  const { session } = useAuth()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const router = useRouter()
  const { terms } = data
  const prev = currentTerm(terms)
  const nextNumber = Math.max(0, ...terms.terms.map((t) => t.number)) + 1

  const [name, setName] = useState(`Term ${nextNumber}`)
  const [starts, setStarts] = useState(new Date().toISOString().slice(0, 10))
  const [depts, setDepts] = useState<Dept[]>([])
  const [president, setPresident] = useState('')
  const [vps, setVps] = useState<string[]>([])
  const [heads, setHeads] = useState<Record<string, string>>({})
  const [advisorMode, setAdvisorMode] = useState<'keep' | 'new'>('keep')
  const [advName, setAdvName] = useState('')
  const [advTitle, setAdvTitle] = useState('')
  const [advPhoto, setAdvPhoto] = useState<string | null>(null)
  const [leaving, setLeaving] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Start from the current term's departments
  useEffect(() => {
    if (prev && !depts.length) setDepts(departmentsOf(terms, prev.id).map((d) => ({ key: d.id, name: d.name, was: d.name })))
  }, [prev?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = useMemo(() => [...data.members].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')), [data.members])
  const prevPositions = prev ? terms.positions.filter((p) => p.term_id === prev.id) : []
  const prevAdvisors = prevPositions.filter((p) => p.kind === 'advisor')
  const prevPeople = Array.from(new Set(prevPositions.filter((p) => p.kind !== 'advisor' && p.profile_id).map((p) => p.profile_id!)))
  const nameOf = (id: string) => data.members.find((m) => m.id === id)?.full_name || 'Unknown'

  const leaderIds = new Set([president, ...vps, ...Object.values(heads)].filter(Boolean))
  const continuing = prevPeople.filter((id) => !leaving.has(id))
  const founderIds = terms.positions.filter((p) => p.kind === 'founder').map((p) => p.profile_id).filter(Boolean) as string[]
  const nowAdmin = data.members.filter((m) => m.role === 'admin').map((m) => m.id)
  const willAdmin = new Set(founderIds.concat(Array.from(leaderIds)))
  const gains = Array.from(willAdmin).filter((id) => !nowAdmin.includes(id))
  const loses = nowAdmin.filter((id) => !willAdmin.has(id))
  const validDepts = depts.filter((d) => d.name.trim())

  const blocked = !name.trim() || !president || busy || !terms.ready

  const start = async () => {
    if (blocked) return
    const ok = await confirm({
      title: `Start ${name.trim()}?`,
      message: `${prev ? `${prev.name} is archived and ` : ''}admin access moves to the new core${loses.length ? ` — ${loses.length} ${loses.length === 1 ? 'person loses' : 'people lose'} it` : ''}. Everything stays editable on the Terms page.`,
      confirmText: `Start ${name.trim()}`,
      variant: 'warning',
    })
    if (!ok) return
    setBusy(true)
    const db: any = createClient()
    try {
      const { data: term, error: e1 } = await db.from('terms').insert({ number: nextNumber, name: name.trim(), starts_on: starts || null, is_current: false }).select().single()
      if (e1) throw e1
      const { data: created, error: e2 } = validDepts.length
        ? await db.from('term_departments').insert(validDepts.map((d, i) => ({ term_id: term.id, name: d.name.trim(), sort: i + 1 }))).select()
        : { data: [], error: null }
      if (e2) throw e2
      const deptId = (key: string) => {
        const i = validDepts.findIndex((d) => d.key === key)
        return i >= 0 ? created[i]?.id : null
      }
      const rows: any[] = []
      rows.push({ term_id: term.id, kind: 'president', profile_id: president, sort: 2 })
      vps.filter(Boolean).forEach((id) => rows.push({ term_id: term.id, kind: 'vice_president', profile_id: id, sort: 3 }))
      Object.entries(heads).forEach(([key, id]) => id && deptId(key) && rows.push({ term_id: term.id, kind: 'head', department_id: deptId(key), profile_id: id, sort: 4 }))
      continuing.filter((id) => !leaderIds.has(id)).forEach((id) => rows.push({ term_id: term.id, kind: 'member', profile_id: id, sort: 9 }))
      if (advisorMode === 'keep') {
        prevAdvisors.forEach((a) => rows.push({ term_id: term.id, kind: 'advisor', profile_id: a.profile_id, display_name: a.display_name, display_title: a.display_title, avatar_url: a.avatar_url, sort: 1 }))
      } else if (advName.trim()) {
        rows.push({ term_id: term.id, kind: 'advisor', display_name: advName.trim(), display_title: advTitle.trim() || null, avatar_url: advPhoto, sort: 1 })
      }
      const { error: e3 } = await db.from('positions').insert(rows)
      if (e3) throw e3
      const { error: e4 } = await db.rpc('make_term_current', { term_id_param: term.id })
      if (e4) throw e4
      await refresh()
      showToast('success', `${name.trim()} has started`)
      router.push('/admin/terms')
    } catch (e: any) {
      showToast('error', `Couldn’t start the term: ${e.message || e}. Nothing was switched over; check the Terms page for a half-made term.`)
      setBusy(false)
    }
  }

  if (!ready) return <div aria-busy="true" className="h-[480px] animate-pulse rounded-xl bg-paper" />
  if (!terms.ready) return <p className="text-text-secondary">Run migration 028 first — see the Terms page.</p>

  const card = 'rounded-xl bg-paper px-6 py-[22px]'
  const step = (n: number) => <span className="font-mono font-normal text-text-tertiary">{n} </span>
  const pick = (value: string, onChange: (v: string) => void, label: string, optional = false) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className={cn(fieldClass, 'min-h-[40px] bg-ink text-sm')}>
      <option value="">{optional ? 'Nobody' : 'Choose a member…'}</option>
      {sorted.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
    </select>
  )

  return (
    <>
      <Link href="/admin/terms" className="mb-3.5 inline-block text-[15px] text-text-secondary hover:text-text-primary">← Terms</Link>
      <h2 className="mb-1 text-[28px] font-bold tracking-[-0.02em]">Start {name.trim() || 'a new term'}</h2>
      <p className="mb-7 max-w-[720px] text-text-tertiary">
        Done once a year. {prev ? `${prev.name} is archived with everyone’s role kept; ` : ''}admin access moves to the new core when you confirm. Everything here stays editable afterwards.
      </p>

      <div className="flex flex-wrap items-start gap-x-10 gap-y-7">
        <div className="flex min-w-0 flex-[1_1_760px] flex-col gap-6">
          <section className={card}>
            <h3 className="mb-3.5 text-[17px] font-bold">{step(1)}The term</h3>
            <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_200px]">
              <label className={labelClass}>Name<input value={name} onChange={(e) => setName(e.target.value)} className={cn(fieldClass, 'mt-1.5 min-h-[44px] bg-ink font-normal')} /></label>
              <label className={labelClass}>Starts<input type="date" value={starts} onChange={(e) => setStarts(e.target.value)} className={cn(fieldClass, 'mt-1.5 min-h-[44px] bg-ink font-mono font-normal [color-scheme:dark]')} /></label>
            </div>
          </section>

          <section className={card}>
            <h3 className="mb-1 text-[17px] font-bold">{step(2)}Departments this term</h3>
            <p className="mb-3.5 text-sm text-text-tertiary">Starts from {prev?.name || 'the last term'}’s list. Rename, remove or add — {prev?.name || 'earlier terms'} keep their own names.</p>
            <ul className="mb-2.5 flex flex-col gap-2">
              {depts.map((d, i) => (
                <li key={d.key} className="flex items-center gap-2">
                  <input value={d.name} onChange={(e) => setDepts(depts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label="Department name" className={cn(fieldClass, 'min-h-[40px] flex-auto bg-ink')} />
                  <span className="min-w-[120px] text-xs text-text-disabled">{!d.was ? 'new' : d.was === d.name.trim() ? `same as ${prev?.name}` : `was ${d.was}`}</span>
                  <button type="button" onClick={() => setDepts(depts.filter((_, j) => j !== i))} aria-label={`Remove ${d.name}`} className="h-8 w-8 text-lg text-text-tertiary hover:text-[#FF9C85]">×</button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setDepts([...depts, { key: `new-${Date.now()}`, name: '', was: null }])} className="min-h-[36px] rounded-md border border-dashed border-control px-3 text-sm font-semibold text-text-secondary hover:text-text-primary">
              + Add a department
            </button>
          </section>

          <section className={card}>
            <h3 className="mb-3.5 text-[17px] font-bold">{step(3)}Leadership</h3>
            <div className="grid items-center gap-x-4 gap-y-2.5 sm:grid-cols-[200px_minmax(0,1fr)]">
              <span className="font-semibold">President</span>
              {pick(president, setPresident, 'President')}
              {vps.map((v, i) => (
                <div key={i} className="contents">
                  <span className="font-semibold">Vice President</span>
                  <span className="flex items-center gap-2">
                    {pick(v, (val) => setVps(vps.map((x, j) => (j === i ? val : x))), 'Vice President', true)}
                    <button type="button" onClick={() => setVps(vps.filter((_, j) => j !== i))} aria-label="Remove vice president" className="h-8 w-8 text-lg text-text-tertiary">×</button>
                  </span>
                </div>
              ))}
              <span className="sm:col-start-2">
                <button type="button" onClick={() => setVps([...vps, ''])} className="text-sm font-semibold text-link hover:text-text-primary">+ Vice President</button>
              </span>
              {validDepts.map((d) => (
                <div key={d.key} className="contents">
                  <span className="font-semibold">Head of {d.name.trim()}</span>
                  {pick(heads[d.key] || '', (val) => setHeads({ ...heads, [d.key]: val }), `Head of ${d.name}`, true)}
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-[#2A2E37] pt-4">
              <span className="mb-2 block font-semibold">Advisor</span>
              <div role="radiogroup" className="mb-3 inline-flex flex-wrap gap-1 rounded-lg bg-ink p-1">
                <button type="button" role="radio" aria-checked={advisorMode === 'keep'} onClick={() => setAdvisorMode('keep')} className={cn('min-h-[34px] rounded-md px-3 text-sm', advisorMode === 'keep' ? 'bg-navy text-white' : 'text-text-secondary')}>
                  {prevAdvisors.length ? `Keep ${prevAdvisors.map((a) => (a.profile_id ? nameOf(a.profile_id) : a.display_name)).join(', ')}` : 'No advisor'}
                </button>
                <button type="button" role="radio" aria-checked={advisorMode === 'new'} onClick={() => setAdvisorMode('new')} className={cn('min-h-[34px] rounded-md px-3 text-sm', advisorMode === 'new' ? 'bg-navy text-white' : 'text-text-secondary')}>
                  Someone new
                </button>
              </div>
              {advisorMode === 'new' && (
                <>
                  <div className="grid gap-2.5 sm:grid-cols-[64px_1fr_1fr] sm:items-center">
                    <button type="button" onClick={() => fileRef.current?.click()} className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-dashed border-control text-xs text-text-tertiary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {advPhoto ? <img src={advPhoto} alt="" className="h-full w-full object-cover" /> : 'Photo'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (f && session?.access_token) {
                        try { setAdvPhoto((await uploadImage(f, 'avatar', session.access_token)).public_url) } catch (err: any) { showToast('error', err.message) }
                      }
                    }} />
                    <input value={advName} onChange={(e) => setAdvName(e.target.value)} placeholder="Full name" aria-label="Advisor name" className={cn(fieldClass, 'min-h-[40px] bg-ink text-sm')} />
                    <input value={advTitle} onChange={(e) => setAdvTitle(e.target.value)} placeholder="Title and school" aria-label="Advisor title" className={cn(fieldClass, 'min-h-[40px] bg-ink text-sm')} />
                  </div>
                  <p className="mt-2 text-[13px] text-text-tertiary">Shown on the Members page. No account is created.</p>
                </>
              )}
            </div>
          </section>

          <section className={card}>
            <h3 className="mb-1 text-[17px] font-bold">{step(4)}Who continues</h3>
            <p className="mb-3 text-sm text-text-tertiary">
              Untick anyone who has left — they become Alumni and keep their {prev?.name || 'earlier'} role on their profile. Add new members from the Members tab afterwards.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {prevPeople.map((id) => {
                const on = !leaving.has(id)
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      const n = new Set(leaving)
                      if (on) n.add(id)
                      else n.delete(id)
                      setLeaving(n)
                    }}
                    className={cn('min-h-[32px] rounded-full border px-2.5 text-[13px]', on ? 'border-[#4A6BA8] bg-navy text-white' : 'border-control text-text-tertiary')}
                  >
                    {on && '✓ '}
                    {nameOf(id)}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="flex min-w-0 flex-[0_1_340px] flex-col gap-3.5 rounded-xl bg-paper px-6 py-[22px] lg:sticky lg:top-[100px]">
          <h3 className="text-[17px] font-bold">When you confirm</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2 text-sm">
            {prev && (<><dt className="text-text-tertiary">{prev.name}</dt><dd className="text-right">archived</dd></>)}
            <dt className="text-text-tertiary">Departments</dt><dd className="text-right font-mono">{validDepts.length}</dd>
            <dt className="text-text-tertiary">Continuing</dt><dd className="text-right font-mono">{continuing.length}</dd>
            <dt className="text-text-tertiary">Alumni</dt><dd className="text-right font-mono">{prevPeople.length - continuing.length}</dd>
          </dl>
          <div className="border-t border-[#2A2E37] pt-3 text-sm">
            <p className="mb-1.5 font-semibold">Admin access</p>
            {founderIds.length > 0 && <p className="text-[#6FD39F]">Keeps: {founderIds.map(nameOf).join(', ')} (Founder)</p>}
            {gains.length > 0 && <p className="text-link">Gains: {gains.map(nameOf).join(', ')}</p>}
            {loses.length > 0 && <p className="text-[#FF9C85]">Loses: {loses.map(nameOf).join(', ')}</p>}
          </div>
          <button type="button" onClick={start} disabled={blocked} className={cn(btnPrimary, 'min-h-[48px]')}>
            {busy ? 'Starting…' : !president ? 'Pick a President first' : `Start ${name.trim()}`}
          </button>
          <Link href="/admin/terms" className={cn(btnSecondary, 'min-h-[42px]')}>Cancel</Link>
        </aside>
      </div>
    </>
  )
}
