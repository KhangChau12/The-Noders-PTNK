'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useRef, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { useAuth } from '@/components/AuthProvider'
import { FilterButton } from '@/components/editorial'
import { MemberAvatar, btnPrimary, btnSecondary, fieldClass, labelClass } from '@/components/dashboard/ui'
import { AdminMember, pointsByMember, profileGaps } from '@/lib/admin'
import { roleTitle } from '@/lib/memberSummary'
import { currentTerm, isAdvisorOnly, roleLine } from '@/lib/terms'
import { createClient } from '@/lib/supabase'
import { formatMonth } from '@/lib/dashboard'
import { SITE_CONFIG } from '@/lib/constants'
import { MemberTermsDialog } from '@/components/admin/MemberTermsDialog'
import { freeUsername, isEmail, makePassword, welcomeMessage } from '@/lib/accounts'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'core' | 'members' | 'incomplete'

export default function MembersAdminPage() {
  return (
    <Suspense>
      <MembersAdmin />
    </Suspense>
  )
}

function MembersAdmin() {
  const { data, ready, patch, api } = useAdmin()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const params = useSearchParams()
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>(params.get('show') === 'incomplete' ? 'incomplete' : 'all')
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState<string | null>(null)
  const [termsFor, setTermsFor] = useState<AdminMember | null>(null)
  const [resetDone, setResetDone] = useState<{ name: string; email: string | null; password: string } | null>(null)
  const isFounder = !!user && data.terms.positions.some((p) => p.kind === 'founder' && p.profile_id === user.id)
  const canReset = (m: AdminMember) => m.id !== user?.id && (m.role !== 'admin' || isFounder)

  const resetPassword = async (m: AdminMember) => {
    setMenu(null)
    const ok = await confirm({
      title: `Reset ${m.full_name}’s password?`,
      message: 'Their current password stops working right away. You’ll get a new one to send them; they can change it from their dashboard.',
      confirmText: 'Reset password',
      cancelText: 'Cancel',
      variant: 'warning',
    })
    if (!ok) return
    try {
      const res = await api('/api/admin/users/reset-password', { method: 'POST', body: { id: m.id } })
      setResetDone({ name: m.full_name || 'them', email: res.email, password: res.password })
    } catch (e: any) {
      showToast('error', e.message)
    }
  }
  const adding = params.get('add') === '1'
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const stats = useMemo(() => {
    const posts = new Map<string, number>()
    for (const p of data.posts) if (p.status === 'published') posts.set(p.author_id, (posts.get(p.author_id) || 0) + 1)
    const products = new Map<string, number>()
    for (const c of data.credits) products.set(c.user_id, (products.get(c.user_id) || 0) + 1)
    return { posts, products, points: pointsByMember(data) }
  }, [data])

  const isIncomplete = (m: AdminMember) => {
    const g = profileGaps(m)
    return !g.photo || !g.bio
  }
  const FILTERS: { id: Filter; label: string; test: (m: AdminMember) => boolean }[] = [
    { id: 'all', label: 'All', test: () => true },
    { id: 'core', label: 'Core team', test: (m) => m.role === 'admin' },
    { id: 'members', label: 'Members', test: (m) => m.role !== 'admin' },
    { id: 'incomplete', label: 'Incomplete profile', test: isIncomplete },
  ]
  let rows = data.members.filter(FILTERS.find((f) => f.id === filter)!.test)
  if (q) rows = rows.filter((m) => `${m.full_name} ${m.username}`.toLowerCase().includes(q.toLowerCase()))

  const update = async (m: AdminMember, changes: Partial<Pick<AdminMember, 'role' | 'contest_count'>>, undo: Partial<AdminMember>) => {
    patch((d) => ({ ...d, members: d.members.map((x) => (x.id === m.id ? { ...x, ...changes } : x)) }))
    try {
      await api('/api/admin/users', { method: 'PATCH', body: { id: m.id, ...changes } })
      if (changes.role) showToast('success', `${m.full_name} is now ${changes.role === 'admin' ? 'core team' : 'a member'}`)
    } catch (e: any) {
      patch((d) => ({ ...d, members: d.members.map((x) => (x.id === m.id ? { ...x, ...undo } : x)) }))
      showToast('error', e.message)
    }
  }

  // Contest count: update the number at once, save after clicks settle
  const bumpContests = (m: AdminMember, delta: number) => {
    const next = Math.max(0, (m.contest_count || 0) + delta)
    patch((d) => ({ ...d, members: d.members.map((x) => (x.id === m.id ? { ...x, contest_count: next } : x)) }))
    clearTimeout(timers.current[m.id])
    timers.current[m.id] = setTimeout(() => {
      api('/api/admin/users', { method: 'PATCH', body: { id: m.id, contest_count: next } }).catch((e) => showToast('error', e.message))
    }, 600)
  }

  const remove = async (m: AdminMember) => {
    setMenu(null)
    const ok = await confirm({
      title: `Remove ${m.full_name}?`,
      message: 'Their account and profile are deleted. Posts they wrote and credits on products may be removed with them. This can’t be undone.',
      confirmText: 'Remove member',
      cancelText: 'Keep',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await api(`/api/admin/users?id=${m.id}`, { method: 'DELETE' })
      patch((d) => ({ ...d, members: d.members.filter((x) => x.id !== m.id) }))
      showToast('success', `${m.full_name} removed`)
    } catch (e: any) {
      showToast('error', e.message)
    }
  }

  const grid = 'md:grid md:grid-cols-[minmax(0,1fr)_132px_92px_56px_70px_108px_64px_110px_36px] md:gap-3.5'

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <FilterButton key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label} <span className="font-mono text-xs opacity-75">{data.members.filter(f.test).length}</span>
            </FilterButton>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name"
            aria-label="Search members"
            className="min-h-[40px] w-[240px] max-w-full rounded-md border border-control bg-paper px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-link focus:outline-none"
          />
          <button type="button" onClick={() => router.push('/admin/users?add=1')} className={btnPrimary}>
            Add member
          </button>
        </div>
      </div>

      {!ready ? (
        <div aria-busy="true" className="h-[480px] animate-pulse rounded-xl bg-paper" />
      ) : (
        <div role="table" aria-label="Members" className="text-[15px]">
          <div role="row" className={cn('hidden px-2.5 py-2 text-[13px] text-text-disabled', grid)}>
            <span role="columnheader">Member</span>
            <span role="columnheader">Role</span>
            <span role="columnheader">Joined</span>
            <span role="columnheader" className="text-right">Posts</span>
            <span role="columnheader" className="text-right">Products</span>
            <span role="columnheader" className="text-center">Contests</span>
            <span role="columnheader" className="text-right">Points</span>
            <span role="columnheader">Profile</span>
            <span role="columnheader"><span className="sr-only">More</span></span>
          </div>
          {rows.map((m) => {
            const g = profileGaps(m)
            const missing = [!g.photo && 'photo', !g.bio && 'bio', !g.link && 'link'].filter(Boolean) as string[]
            const posts = stats.posts.get(m.id) || 0
            const products = stats.products.get(m.id) || 0
            const isCore = m.role === 'admin'
            return (
              <div key={m.id} role="row" className={cn('relative flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule px-2.5 py-2.5 hover:bg-[#12151B]', grid, 'md:items-center')}>
                <span role="cell" className="flex min-w-0 flex-[1_1_100%] items-center gap-3 md:flex-none">
                  <MemberAvatar name={m.full_name} src={m.avatar_url} className="h-9 w-9 shrink-0 rounded-full text-xs" />
                  <span className="min-w-0">
                    <Link href={`/members/${m.id}`} className="block truncate font-semibold text-text-primary hover:text-link">{m.full_name}</Link>
                    <span className="block truncate text-[13px] text-text-tertiary">{data.terms.ready ? roleLine(data.terms, m.id, m.role === 'admin' ? 'Core team' : 'Member') : roleTitle(m.bio, m.role)}{!g.bio && ' · no bio'}</span>
                  </span>
                </span>
                <span role="cell">
                  {data.terms.ready ? (
                    <Link
                      href="/admin/terms"
                      title="Admin access follows positions — change it on the Terms page"
                      className={cn('flex min-h-[34px] w-full items-center rounded-md px-2.5 text-sm', isCore ? 'bg-[#1C2A44] text-on-navy' : 'text-text-tertiary')}
                    >
                      {isCore ? 'Admin access' : 'No admin'}
                    </Link>
                  ) : (
                  <button
                    type="button"
                    disabled={m.id === user?.id}
                    onClick={() => update(m, { role: isCore ? 'member' : 'admin' }, { role: m.role })}
                    title={m.id === user?.id ? 'You can’t change your own role' : 'Switch role'}
                    className={cn('flex min-h-[34px] w-full items-center justify-between gap-2 rounded-md border border-control px-2.5 text-sm disabled:opacity-60', isCore ? 'bg-[#1C2A44] text-on-navy' : 'bg-paper text-text-secondary')}
                  >
                    {isCore ? 'Core team' : 'Member'} <span aria-hidden="true" className="text-text-disabled">⇄</span>
                  </button>
                  )}
                </span>
                <span role="cell" className="font-mono text-[13px] text-text-tertiary">{formatMonth(m.created_at)}</span>
                <span role="cell" className={cn('font-mono text-sm md:text-right', posts ? 'text-text-primary' : 'text-text-disabled')}>
                  {posts}<span className="text-text-tertiary md:hidden"> posts</span>
                </span>
                <span role="cell" className={cn('font-mono text-sm md:text-right', products ? 'text-text-primary' : 'text-text-disabled')}>
                  {products}<span className="text-text-tertiary md:hidden"> products</span>
                </span>
                <span role="cell" className="flex items-center justify-center gap-0.5">
                  <button type="button" aria-label={`One fewer contest for ${m.full_name}`} onClick={() => bumpContests(m, -1)} className="h-7 w-7 rounded-md border border-control text-text-secondary hover:text-text-primary">−</button>
                  <span className="min-w-[26px] text-center font-mono text-sm" aria-label={`${m.contest_count || 0} contests`}>{m.contest_count || 0}</span>
                  <button type="button" aria-label={`One more contest for ${m.full_name}`} onClick={() => bumpContests(m, 1)} className="h-7 w-7 rounded-md border border-control text-text-secondary hover:text-text-primary">+</button>
                </span>
                <span role="cell" className="font-mono text-sm md:text-right">{stats.points.get(m.id) || 0}<span className="text-text-tertiary md:hidden"> pts</span></span>
                <span role="cell" className="flex items-center gap-[5px]" title={missing.length ? `Missing: ${missing.join(', ')}` : 'Photo, bio and a link'}>
                  {[g.photo, g.bio, g.link].map((ok, i) => (
                    <span key={i} aria-hidden="true" className={cn('h-2 w-2 rounded-full', ok ? 'bg-[#5B7FD6]' : 'bg-control')} />
                  ))}
                  <span className={cn('ml-1 text-xs', missing.length ? 'text-signal' : 'text-text-disabled')}>{missing.length ? `no ${missing[0]}` : 'complete'}</span>
                </span>
                <span role="cell" className="ml-auto md:ml-0">
                  <button type="button" aria-label={`More for ${m.full_name}`} aria-expanded={menu === m.id} onClick={() => setMenu(menu === m.id ? null : m.id)} className="h-8 w-8 rounded-md text-text-tertiary hover:bg-white/[0.05] hover:text-text-primary">
                    ⋯
                  </button>
                  {menu === m.id && (
                    <div className="absolute right-2 top-[calc(100%-6px)] z-20 flex w-48 flex-col rounded-lg border border-control bg-paper p-1 text-sm shadow-lg">
                      {data.terms.ready && (
                        <button type="button" onClick={() => { setMenu(null); setTermsFor(m) }} className="rounded px-3 py-2 text-left text-text-primary hover:bg-white/[0.05]">Terms and roles…</button>
                      )}
                      {!isAdvisorOnly(data.terms, m.id) && <Link href={`/members/${m.id}`} className="rounded px-3 py-2 text-text-primary hover:bg-white/[0.05]">View public profile</Link>}
                      {canReset(m) && (
                        <button type="button" onClick={() => resetPassword(m)} className="rounded px-3 py-2 text-left text-text-primary hover:bg-white/[0.05]">Reset password…</button>
                      )}
                      {m.id !== user?.id && (
                        <button type="button" onClick={() => remove(m)} className="rounded px-3 py-2 text-left text-[#FF9C85] hover:bg-white/[0.05]">Remove member…</button>
                      )}
                    </div>
                  )}
                </span>
              </div>
            )
          })}
          {rows.length === 0 && <p className="border-t border-rule px-2.5 py-6 text-text-tertiary">No members match.</p>}
        </div>
      )}
      <p className="mt-3.5 text-[13px] text-text-disabled">Profile dots: photo · bio · a link. Contest counts save as you change them; admin access follows each person’s role in the current term (⋯ → Terms and roles).</p>

      {adding && <AddMemberPanel onClose={() => router.replace('/admin/users')} />}
      {termsFor && <MemberTermsDialog member={termsFor} onClose={() => setTermsFor(null)} />}
      {resetDone && <ResetDoneDialog {...resetDone} onClose={() => setResetDone(null)} />}
    </>
  )
}

/* ---------- Add member ---------- */

function AddMemberPanel({ onClose }: { onClose: () => void }) {
  const { data, refresh, api } = useAdmin()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const term = currentTerm(data.terms)
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const [password] = useState(makePassword)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)

  const username = freeUsername(name, new Set(data.members.map((m) => m.username)))
  const emailOk = isEmail(email)
  const message = welcomeMessage(name, email, password)

  const create = async () => {
    if (!name.trim() || !emailOk || !username) return
    setBusy(true)
    try {
      const res = await api('/api/admin/create-user', {
        method: 'POST',
        body: { email: email.trim(), password, profileData: { full_name: name.trim(), username, role: term ? 'member' : role } },
      })
      // Their term membership is what puts them on the Members page
      if (term && res.user?.id) {
        const { error } = await (createClient() as any).from('positions').insert({ term_id: term.id, kind: 'member', profile_id: res.user.id, sort: 9 })
        if (error) showToast('error', `Account made, but couldn’t add them to ${term.name}: ${error.message}`)
      }
      try {
        await navigator.clipboard.writeText(message)
        setCopied(true)
      } catch {}
      setDone(true)
      refresh()
      showToast('success', `${name.trim()} added`)
    } catch (e: any) {
      showToast('error', e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[rgba(5,8,14,0.55)]" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-labelledby="add-title" className="fixed inset-y-0 right-0 z-50 flex w-[min(480px,100vw)] flex-col gap-[18px] overflow-y-auto border-l border-rule bg-paper p-7">
        <div className="flex items-center justify-between">
          <h2 id="add-title" className="text-[22px] font-bold">{done ? 'Member added' : 'Add a member'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="h-9 w-9 text-[22px] text-text-tertiary hover:text-text-primary">×</button>
        </div>
        {!done && (
          <>
            <div>
              <label htmlFor="nm" className={labelClass}>Full name</label>
              <input id="nm" autoFocus value={name} onChange={(e) => setName(e.target.value)} className={cn(fieldClass, 'min-h-[44px] bg-ink')} />
            </div>
            <div>
              <label htmlFor="em" className={labelClass}>Email</label>
              <input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={cn(fieldClass, 'min-h-[44px] bg-ink')} />
            </div>
            {term ? (
              <p className="rounded-lg bg-ink px-4 py-3 text-sm text-text-secondary">
                Joins <b className="text-text-primary">{term.name}</b> as a member. Leadership roles are set on the{' '}
                <Link href="/admin/terms" className="text-link">Terms</Link> page.
              </p>
            ) : (
              <div>
                <span className={labelClass}>Role</span>
                <div role="radiogroup" aria-label="Role" className="flex gap-1 rounded-lg bg-ink p-1">
                  {(['member', 'admin'] as const).map((r) => (
                    <button key={r} type="button" role="radio" aria-checked={role === r} onClick={() => setRole(r)} className={cn('min-h-[34px] flex-1 rounded-md text-sm', role === r ? 'bg-navy text-white' : 'text-text-secondary')}>
                      {r === 'admin' ? 'Core team' : 'Member'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-2 rounded-lg bg-ink px-4 py-3.5 text-sm">
              <dt className="text-text-tertiary">Username</dt>
              <dd className="font-mono">{username || '—'}</dd>
              <dt className="text-text-tertiary">Password</dt>
              <dd className="font-mono">{password} <span className="font-sans text-text-tertiary">· generated</span></dd>
            </dl>
            <p className="-mt-2 text-[13px] text-text-tertiary">Both are made for you. The member can change them from their dashboard.</p>
          </>
        )}
        <div>
          <p className="mb-1.5 text-sm font-semibold">Welcome message</p>
          <pre className="whitespace-pre-wrap rounded-lg bg-ink px-4 py-3.5 font-sans text-sm text-text-secondary">{message}</pre>
        </div>
        <div className="mt-auto flex gap-2.5">
          {done ? (
            <>
              <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(message); setCopied(true) } catch {} }} className={cn(btnPrimary, 'flex-auto')}>
                {copied ? 'Copied ✓' : 'Copy message'}
              </button>
              <button type="button" onClick={onClose} className={btnSecondary}>Done</button>
            </>
          ) : (
            <>
              <button type="button" onClick={create} disabled={busy || !name.trim() || !emailOk || !username} className={cn(btnPrimary, 'min-h-[46px] flex-auto')}>
                {busy ? 'Creating…' : 'Create and copy message'}
              </button>
              <button type="button" onClick={onClose} className={cn(btnSecondary, 'min-h-[46px]')}>Cancel</button>
            </>
          )}
        </div>
      </aside>
    </>
  )
}

/* ---------- Password reset result ---------- */

function ResetDoneDialog({ name, email, password, onClose }: { name: string; email: string | null; password: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const first = name.trim().split(/\s+/).pop() || 'there'
  const message = `Hi ${first}, your password for The Noders was reset.\nSign in at ${SITE_CONFIG.url.replace(/^https?:\/\//, '')}/login\n${email ? `Email: ${email}\n` : ''}New password: ${password}\nPlease change it from your dashboard (Profile → Change password).`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {}
  }
  return (
    <>
      <div className="fixed inset-0 z-40 bg-[rgba(5,8,14,0.6)]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="reset-title" className="fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[14px] border border-[#2A2E37] bg-paper p-[26px] shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
        <h2 id="reset-title" className="mb-1.5 text-xl font-bold">New password for {name}</h2>
        <p className="mb-4 text-sm text-text-tertiary">Shown once — copy it now. The old password no longer works.</p>
        <p className="mb-4 rounded-lg bg-ink px-4 py-3 font-mono text-lg tracking-wide">{password}</p>
        <pre className="mb-5 whitespace-pre-wrap rounded-lg bg-ink px-4 py-3.5 font-sans text-sm text-text-secondary">{message}</pre>
        <div className="flex justify-end gap-2.5">
          <button type="button" onClick={copy} className={btnPrimary}>{copied ? 'Copied ✓' : 'Copy message'}</button>
          <button type="button" onClick={onClose} className={btnSecondary}>Done</button>
        </div>
      </div>
    </>
  )
}
