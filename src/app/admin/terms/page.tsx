'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { MemberAvatar, btnPrimary, btnSecondary, fieldClass } from '@/components/dashboard/ui'
import { createClient } from '@/lib/supabase'
import { uploadImage } from '@/lib/upload'
import { formatDay, formatMonth } from '@/lib/dashboard'
import { KIND_RANK, departmentsOf, isAdvisorOnly, positionLabel, type Position, type PositionKind, type Term } from '@/lib/terms'
import { cn } from '@/lib/utils'

const db = () => createClient() as any

export default function TermsAdminPage() {
  return (
    <Suspense>
      <TermsAdmin />
    </Suspense>
  )
}

function TermsAdmin() {
  const { data, ready, refresh } = useAdmin()
  const { showToast } = useToast()
  const params = useSearchParams()
  const { terms } = data
  const [selected, setSelected] = useState<string | null>(null)
  const term = terms.terms.find((t) => t.id === selected) || terms.terms.find((t) => String(t.number) === params.get('term')) || terms.terms.find((t) => t.is_current) || terms.terms[0]

  /** Run a write, refresh, and move admin access if the current term changed. */
  const run = async (fn: () => Promise<{ error?: any } | void>, ok?: string, affectsAccess = true) => {
    const res = await fn()
    if (res && res.error) {
      showToast('error', res.error.message || 'Couldn’t save')
      return false
    }
    if (affectsAccess && term?.is_current) await db().rpc('sync_admin_roles')
    await refresh()
    if (ok) showToast('success', ok)
    return true
  }

  if (!ready) return <div aria-busy="true" className="h-[480px] animate-pulse rounded-xl bg-paper" />
  if (!terms.ready) {
    return (
      <div className="max-w-[640px] rounded-xl bg-paper p-7">
        <h2 className="mb-2 text-xl font-bold">Terms need migration 028</h2>
        <p className="text-text-secondary">Run <code className="font-mono text-text-primary">supabase/migrations/028_terms_and_positions.sql</code> in the Supabase SQL editor. It creates Term 1 from today’s members and moves admin access onto positions.</p>
      </div>
    )
  }

  const founders = terms.positions.filter((p) => p.kind === 'founder')
  const cur = terms.terms.find((t) => t.is_current)
  // Newer than the current term but never made current = a start that failed partway
  const notStarted = (t: Term) => !t.is_current && !!cur && t.number > cur.number
  const nextNumber = Math.max(0, ...terms.terms.filter((t) => !notStarted(t)).map((t) => t.number)) + 1
  const today = new Date().toISOString().slice(0, 10)
  const overdue = cur?.ends_on && cur.ends_on < today ? cur : null

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <nav aria-label="Terms" className="flex flex-wrap gap-2">
          {terms.terms.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              aria-pressed={t.id === term?.id}
              className={cn('min-h-[40px] rounded-md border px-3.5 text-sm font-semibold', t.id === term?.id ? 'border-[#4A6BA8] bg-navy text-white' : 'border-control text-text-secondary hover:text-text-primary')}
            >
              {t.name}
              {t.is_current && <span className="ml-1.5 font-normal text-[#6FD39F]">● current</span>}
              {notStarted(t) && <span className="ml-1.5 font-normal text-signal">not started</span>}
            </button>
          ))}
        </nav>
        <Link href="/admin/terms/new" className={btnPrimary}>
          Start Term {nextNumber}…
        </Link>
      </div>

      {overdue && (
        <div role="status" className="mb-6 rounded-xl border border-[#4A3F22] bg-[#221D12] px-5 py-4 text-sm text-text-secondary">
          <b className="text-text-primary">{overdue.name} ended on {formatDay(overdue.ends_on!)} but is still the current term.</b> A term only stops being current when the next one is started, so its core team keeps admin access until you start Term {nextNumber}.
        </div>
      )}

      {term && (
        <div className="flex flex-wrap items-start gap-x-10 gap-y-8">
          <div className="flex min-w-0 flex-[1_1_720px] flex-col gap-8">
            <TermDetails key={term.id} term={term} run={run} notStarted={notStarted(term)} />
            <Departments term={term} run={run} />
            <Positions term={term} run={run} />
          </div>
          <aside className="flex min-w-0 flex-[0_1_360px] flex-col gap-5">
            <Founders founders={founders} run={run} />
            <section className="rounded-xl bg-paper px-[22px] py-5">
              <h3 className="mb-1.5 text-base font-bold">Who can use admin</h3>
              <p className="mb-3 text-sm text-text-secondary">
                The Founder, plus the <b className="text-text-primary">current</b> term’s President, Vice Presidents and Heads. It updates whenever positions in the current term change. Advisors are shown on the site but don’t sign in.
              </p>
              <ul className="flex flex-col gap-1.5 text-sm">
                {data.members.filter((m) => m.role === 'admin').map((m) => (
                  <li key={m.id} className="flex items-center gap-2">
                    <MemberAvatar name={m.full_name} src={m.avatar_url} className="h-6 w-6 rounded-full text-[10px]" />
                    {m.full_name}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </>
  )
}

type Run = (fn: () => Promise<{ error?: any } | void>, ok?: string, affectsAccess?: boolean) => Promise<boolean>

function TermDetails({ term, run, notStarted }: { term: Term; run: Run; notStarted: boolean }) {
  const [name, setName] = useState(term.name)
  const [starts, setStarts] = useState(term.starts_on || '')
  const [ends, setEnds] = useState(term.ends_on || '')
  const dirty = name !== term.name || starts !== (term.starts_on || '') || ends !== (term.ends_on || '')
  const bad = !name.trim() || (!!starts && !!ends && ends < starts)
  const { data } = useAdmin()
  const { confirm } = useConfirm()
  const people = data.terms.positions.filter((p) => p.term_id === term.id && p.profile_id && p.kind !== 'advisor').length
  const leaders = data.terms.positions.filter((p) => p.term_id === term.id && ['president', 'vice_president', 'head'].includes(p.kind)).length

  const makeCurrent = async () => {
    const ok = await confirm({
      title: `Make ${term.name} current?`,
      message: `The current term ends and admin access moves to ${term.name}’s President, Vice Presidents and Heads (${leaders} now). Only the ${people} ${people === 1 ? 'person' : 'people'} listed in ${term.name} count as current members; everyone else becomes Alumni. Add people first if needed.`,
      confirmText: `Make ${term.name} current`,
      variant: 'warning',
    })
    if (ok) run(() => db().rpc('make_term_current', { term_id_param: term.id }), `${term.name} is now the current term`, false)
  }

  return (
    <section className="rounded-xl bg-paper px-6 py-[22px]">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[22px] font-bold">{term.name}</h2>
        {notStarted ? (
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="text-signal">Not started yet</span>
            <button type="button" onClick={makeCurrent} className={cn(btnSecondary, 'min-h-[36px] text-sm')}>Make {term.name} current…</button>
          </span>
        ) : (
          <span className={cn('text-sm', term.is_current ? 'text-[#6FD39F]' : 'text-text-tertiary')}>{term.is_current ? 'Current term' : 'Past term — still editable'}</span>
        )}
      </div>
      <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_170px_170px]">
        <label className="text-sm font-semibold">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} className={cn(fieldClass, 'mt-1.5 min-h-[42px] bg-ink')} />
        </label>
        <label className="text-sm font-semibold">
          Starts
          <input type="date" value={starts} onChange={(e) => setStarts(e.target.value)} className={cn(fieldClass, 'mt-1.5 min-h-[42px] bg-ink font-mono [color-scheme:dark]')} />
        </label>
        <label className="text-sm font-semibold">
          Ends
          <input type="date" value={ends} onChange={(e) => setEnds(e.target.value)} className={cn(fieldClass, 'mt-1.5 min-h-[42px] bg-ink font-mono [color-scheme:dark]')} />
        </label>
      </div>
      {!!starts && !!ends && ends < starts && <p className="mt-2 text-sm text-[#FF9C85]">The end date is before the start date.</p>}
      {dirty && (
        <div className="mt-3.5 flex gap-2">
          <button
            type="button"
            disabled={bad}
            onClick={() => run(() => db().from('terms').update({ name: name.trim(), starts_on: starts || null, ends_on: ends || null }).eq('id', term.id), 'Term saved', false)}
            className={btnPrimary}
          >
            Save
          </button>
          <button type="button" onClick={() => { setName(term.name); setStarts(term.starts_on || ''); setEnds(term.ends_on || '') }} className={btnSecondary}>
            Discard
          </button>
        </div>
      )}
    </section>
  )
}

function Departments({ term, run }: { term: Term; run: Run }) {
  const { data } = useAdmin()
  const { confirm } = useConfirm()
  const depts = departmentsOf(data.terms, term.id)
  const [adding, setAdding] = useState('')

  const rename = (id: string, value: string, old: string) => {
    const v = value.trim()
    if (!v || v === old) return
    run(() => db().from('term_departments').update({ name: v }).eq('id', id), `Renamed to ${v}`, false)
  }
  const remove = async (id: string, name: string) => {
    const heads = data.terms.positions.filter((p) => p.department_id === id).length
    const ok = await confirm({
      title: `Remove ${name}?`,
      message: heads ? `Its head${heads > 1 ? 's' : ''} stay${heads > 1 ? '' : 's'} in ${term.name} but lose the department name.` : `${term.name} won’t list this department any more.`,
      confirmText: 'Remove',
      variant: 'danger',
    })
    if (ok) run(() => db().from('term_departments').delete().eq('id', id), `${name} removed`, false)
  }

  return (
    <section>
      <h3 className="mb-1 text-lg font-bold">Departments</h3>
      <p className="mb-3 text-sm text-text-tertiary">Each term has its own list. Renaming here doesn’t change other terms.</p>
      <ul className="mb-2.5 flex flex-col gap-2">
        {depts.map((d) => (
          <li key={d.id} className="flex items-center gap-2">
            <input
              defaultValue={d.name}
              onBlur={(e) => rename(d.id, e.target.value, d.name)}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              aria-label={`Department name: ${d.name}`}
              className={cn(fieldClass, 'min-h-[40px] flex-auto')}
            />
            <button type="button" onClick={() => remove(d.id, d.name)} aria-label={`Remove ${d.name}`} className="h-9 w-9 text-lg text-text-tertiary hover:text-[#FF9C85]">×</button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!adding.trim()) return
          run(() => db().from('term_departments').insert({ term_id: term.id, name: adding.trim(), sort: depts.length + 1 }), `${adding.trim()} added`, false).then((ok) => ok && setAdding(''))
        }}
        className="flex gap-2"
      >
        <input value={adding} onChange={(e) => setAdding(e.target.value)} placeholder="New department" aria-label="New department" className={cn(fieldClass, 'min-h-[40px] flex-auto')} />
        <button type="submit" disabled={!adding.trim()} className={btnSecondary}>Add</button>
      </form>
    </section>
  )
}

const KIND_OPTIONS: { kind: PositionKind; label: string }[] = [
  { kind: 'president', label: 'President' },
  { kind: 'vice_president', label: 'Vice President' },
  { kind: 'head', label: 'Head of a department' },
  { kind: 'member', label: 'Member' },
]

function Positions({ term, run }: { term: Term; run: Run }) {
  const { data } = useAdmin()
  const { confirm } = useConfirm()
  const tp = data.terms.positions.filter((p) => p.term_id === term.id)
  const depts = departmentsOf(data.terms, term.id)
  const leaders = tp.filter((p) => p.kind !== 'member' && p.kind !== 'advisor').sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind] || positionLabel(a, data.terms).localeCompare(positionLabel(b, data.terms)))
  const advisors = tp.filter((p) => p.kind === 'advisor')
  const members = tp.filter((p) => p.kind === 'member')
  const memberName = (id: string | null) => data.members.find((m) => m.id === id)?.full_name || 'Unknown'
  const sorted = useMemo(() => [...data.members].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')), [data.members])

  const [kind, setKind] = useState<PositionKind>('head')
  const [dept, setDept] = useState('')
  const [who, setWho] = useState('')
  const [addMembers, setAddMembers] = useState<string[]>([])

  const reassign = (p: Position, profileId: string) => run(() => db().from('positions').update({ profile_id: profileId }).eq('id', p.id), `${positionLabel(p, data.terms)} updated`)
  const remove = async (p: Position) => {
    const ok = await confirm({
      title: `Remove ${p.profile_id ? memberName(p.profile_id) : p.display_name} as ${positionLabel(p, data.terms)}?`,
      message: term.is_current && p.kind !== 'member' && p.kind !== 'advisor' ? 'They lose admin access unless they hold another leading position.' : `They’re no longer listed with this role in ${term.name}.`,
      confirmText: 'Remove',
      variant: 'danger',
    })
    if (ok) run(() => db().from('positions').delete().eq('id', p.id), 'Removed')
  }
  const add = () => {
    if (!who || (kind === 'head' && !dept)) return
    run(
      () => db().from('positions').insert({ term_id: term.id, kind, profile_id: who, department_id: kind === 'head' ? dept : null, sort: KIND_RANK[kind] }),
      'Position added'
    ).then((ok) => ok && setWho(''))
  }
  const notInTerm = sorted.filter((m) => !tp.some((p) => p.profile_id === m.id) && !isAdvisorOnly(data.terms, m.id))
  // People from the term before this one who aren't in this term yet
  const prevTerm = data.terms.terms.find((t) => t.number === term.number - 1)
  const fromPrev = prevTerm ? notInTerm.filter((m) => data.terms.positions.some((p) => p.term_id === prevTerm.id && p.profile_id === m.id && p.kind !== 'advisor')) : []
  const [findMember, setFindMember] = useState('')
  const shown = notInTerm.filter((m) => (m.full_name || '').toLowerCase().includes(findMember.trim().toLowerCase()))
  const toggle = (id: string) => setAddMembers((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))

  return (
    <>
      <section>
        <h3 className="mb-3 text-lg font-bold">Leadership</h3>
        <ul className="border-b border-rule">
          {leaders.map((p) => (
            <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1.5 border-t border-rule px-1 py-2.5 sm:grid-cols-[190px_minmax(0,1fr)_32px]">
              <span className="font-semibold">{positionLabel(p, data.terms)}</span>
              <select value={p.profile_id || ''} onChange={(e) => reassign(p, e.target.value)} aria-label={`Who is ${positionLabel(p, data.terms)}`} className={cn(fieldClass, 'col-span-2 min-h-[38px] text-sm sm:col-span-1')}>
                {sorted.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
              <button type="button" onClick={() => remove(p)} aria-label="Remove" className="row-start-1 h-8 w-8 justify-self-end text-lg text-text-tertiary hover:text-[#FF9C85] sm:row-start-auto">×</button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-paper p-3">
          <select value={kind} onChange={(e) => setKind(e.target.value as PositionKind)} aria-label="Position" className={cn(fieldClass, 'min-h-[38px] w-auto text-sm')}>
            {KIND_OPTIONS.filter((o) => o.kind !== 'member').map((o) => <option key={o.kind} value={o.kind}>{o.label}</option>)}
          </select>
          {kind === 'head' && (
            <select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department" className={cn(fieldClass, 'min-h-[38px] w-auto text-sm')}>
              <option value="">Department…</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
          <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Member" className={cn(fieldClass, 'min-h-[38px] w-auto flex-auto text-sm')}>
            <option value="">Who…</option>
            {sorted.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </select>
          <button type="button" onClick={add} disabled={!who || (kind === 'head' && !dept)} className={btnSecondary}>Add</button>
        </div>
      </section>

      <AdvisorEditor term={term} advisors={advisors} run={run} />

      <section>
        <h3 className="mb-1 text-lg font-bold">Members <span className="font-mono text-sm font-normal text-text-tertiary">{members.length}</span></h3>
        <p className="mb-3 text-sm text-text-tertiary">
          Everyone else in {term.name}. They show on the Members page under this term. Leaders above already count, so they don’t need adding here.
        </p>
        {members.length ? (
          <ul className="mb-4 flex flex-wrap gap-1.5">
            {members.map((p) => (
              <li key={p.id} className="inline-flex items-center gap-1 rounded-full border border-control py-1 pl-3 pr-1 text-[13px]">
                {memberName(p.profile_id)}
                <button type="button" onClick={() => run(() => db().from('positions').delete().eq('id', p.id), 'Removed from the term')} aria-label={`Remove ${memberName(p.profile_id)}`} className="h-6 w-6 rounded-full text-text-tertiary hover:text-[#FF9C85]">×</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 rounded-lg border border-dashed border-control px-4 py-3 text-sm text-text-tertiary">No members in {term.name} yet.</p>
        )}
        {notInTerm.length > 0 && (
          <div className="rounded-lg bg-paper p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <span className="text-sm font-semibold">Add people to {term.name}</span>
              <div className="flex flex-wrap items-center gap-3">
                {fromPrev.length > 0 && prevTerm && (
                  <button type="button" onClick={() => setAddMembers(Array.from(new Set([...addMembers, ...fromPrev.map((m) => m.id)])))} className="text-sm font-semibold text-link hover:text-text-primary">
                    Select everyone from {prevTerm.name} ({fromPrev.length})
                  </button>
                )}
                {addMembers.length > 0 && (
                  <button type="button" onClick={() => setAddMembers([])} className="text-sm text-text-tertiary hover:text-text-primary">Clear</button>
                )}
              </div>
            </div>
            {notInTerm.length > 8 && (
              <input type="search" value={findMember} onChange={(e) => setFindMember(e.target.value)} placeholder="Find a name" aria-label="Find a member" className={cn(fieldClass, 'mb-3 min-h-[38px] bg-ink text-sm')} />
            )}
            <div role="group" aria-label="People not in this term" className="flex flex-wrap gap-1.5">
              {shown.map((m) => {
                const on = addMembers.includes(m.id)
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(m.id)}
                    className={cn('min-h-[34px] rounded-full border px-3 text-[13px] transition-colors', on ? 'border-[#4A6BA8] bg-navy text-white' : 'border-dashed border-control text-text-secondary hover:border-text-tertiary hover:text-text-primary')}
                  >
                    {on ? '✓ ' : '+ '}
                    {m.full_name}
                  </button>
                )
              })}
              {!shown.length && <span className="text-sm text-text-tertiary">No one matches.</span>}
            </div>
            <button
              type="button"
              disabled={!addMembers.length}
              onClick={() => run(() => db().from('positions').insert(addMembers.map((id) => ({ term_id: term.id, kind: 'member', profile_id: id, sort: 9 }))), `${addMembers.length} added to ${term.name}`).then((ok) => ok && setAddMembers([]))}
              className={cn(btnPrimary, 'mt-4')}
            >
              {addMembers.length ? `Add ${addMembers.length} to ${term.name}` : 'Pick people to add'}
            </button>
          </div>
        )}
      </section>
    </>
  )
}

function AdvisorEditor({ term, advisors, run }: { term: Term; advisors: Position[]; run: Run }) {
  const { data } = useAdmin()
  const { session } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = async (file?: File) => {
    if (!file || !session?.access_token) return
    try {
      setUploading(true)
      setPhoto((await uploadImage(file, 'avatar', session.access_token)).public_url)
    } catch (e: any) {
      showToast('error', e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section>
      <h3 className="mb-1 text-lg font-bold">Advisor</h3>
      <p className="mb-3 text-sm text-text-tertiary">Shown on the Members page; no account and no admin access.</p>
      <ul className="mb-3 flex flex-col gap-2">
        {advisors.map((a) => (
          <AdvisorRow key={a.id} a={a} name={a.profile_id ? data.members.find((m) => m.id === a.profile_id)?.full_name || '' : a.display_name || ''} run={run} />
        ))}
      </ul>
      <div className="grid gap-2 rounded-lg bg-paper p-3 sm:grid-cols-[56px_1fr_1fr_auto] sm:items-center">
        <button type="button" onClick={() => fileRef.current?.click()} className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-dashed border-control text-[11px] text-text-tertiary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : uploading ? '…' : 'Photo'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => upload(e.target.files?.[0])} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-label="Advisor name" className={cn(fieldClass, 'min-h-[40px] text-sm')} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title and school" aria-label="Advisor title" className={cn(fieldClass, 'min-h-[40px] text-sm')} />
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() =>
            run(() => db().from('positions').insert({ term_id: term.id, kind: 'advisor', display_name: name.trim(), display_title: title.trim() || null, avatar_url: photo, sort: 1 }), 'Advisor added', false).then(
              (ok) => ok && (setName(''), setTitle(''), setPhoto(null))
            )
          }
          className={btnSecondary}
        >
          Add advisor
        </button>
      </div>
    </section>
  )
}

function AdvisorRow({ a, name, run }: { a: Position; name: string; run: Run }) {
  const { confirm } = useConfirm()
  const [title, setTitle] = useState(a.display_title || '')
  useEffect(() => setTitle(a.display_title || ''), [a.display_title])
  return (
    <li className="flex flex-wrap items-center gap-2 border-t border-rule pt-2">
      <span className="min-w-[160px] font-semibold">{name}</span>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => title !== (a.display_title || '') && run(() => db().from('positions').update({ display_title: title.trim() || null }).eq('id', a.id), 'Advisor title saved', false)}
        placeholder="Title and school"
        aria-label={`${name}’s title`}
        className={cn(fieldClass, 'min-h-[38px] flex-auto text-sm')}
      />
      <button
        type="button"
        onClick={async () => (await confirm({ title: `Remove ${name} as advisor?`, message: 'They won’t be listed for this term any more.', confirmText: 'Remove', variant: 'danger' })) && run(() => db().from('positions').delete().eq('id', a.id), 'Advisor removed', false)}
        aria-label={`Remove ${name}`}
        className="h-8 w-8 text-lg text-text-tertiary hover:text-[#FF9C85]"
      >
        ×
      </button>
    </li>
  )
}

function Founders({ founders, run }: { founders: Position[]; run: Run }) {
  const { data } = useAdmin()
  return (
    <section className="rounded-xl bg-paper px-[22px] py-5">
      <h3 className="mb-1.5 text-base font-bold">Founder</h3>
      <p className="mb-3 text-sm text-text-secondary">A standing role outside any term, with admin access in every term.</p>
      {founders.map((f) => {
        const m = data.members.find((x) => x.id === f.profile_id)
        return (
          <div key={f.id} className="flex items-center gap-2.5">
            <MemberAvatar name={m?.full_name} src={m?.avatar_url} className="h-8 w-8 rounded-full text-xs" />
            <span className="font-semibold">{m?.full_name || f.display_name}</span>
            {data.terms.terms.length > 0 && <span className="text-sm text-text-tertiary">since {formatMonth(data.terms.terms[data.terms.terms.length - 1].starts_on)}</span>}
          </div>
        )
      })}
    </section>
  )
}
