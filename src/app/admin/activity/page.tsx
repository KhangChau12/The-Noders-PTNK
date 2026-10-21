'use client'

import { useMemo, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { useToast } from '@/components/Toast'
import { btnPrimary } from '@/components/dashboard/ui'
import { pointsByMember } from '@/lib/admin'
import { formatDay } from '@/lib/dashboard'
import { cn } from '@/lib/utils'

const NEW = '__new__'

export default function PointsAdminPage() {
  const { data, ready, refresh, api } = useAdmin()
  const { showToast } = useToast()
  const [act, setAct] = useState<string>('')
  const [newName, setNewName] = useState('')
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [pts, setPts] = useState('')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)

  // Last points given per activity, to prefill
  const lastPoints = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of data.logs) if (l.task_template_id) m.set(l.task_template_id, l.points)
    return m
  }, [data.logs])

  const totals = useMemo(() => pointsByMember(data), [data])
  const p = parseInt(pts, 10) || 0
  const activityName = act === NEW ? newName.trim() : data.templates.find((t) => t.id === act)?.name || ''

  const pick = (id: string) => {
    setAct(id)
    if (id !== NEW) setPts(String(lastPoints.get(id) ?? 10))
  }
  const toggle = (id: string) => {
    const next = new Set(sel)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSel(next)
  }

  const standings = data.members
    .map((m) => {
      const base = totals.get(m.id) || 0
      return { m, base, now: base + (sel.has(m.id) ? p : 0) }
    })
    .sort((a, b) => b.now - a.now)
  const max = Math.max(1, ...standings.map((s) => s.now))
  const total = Array.from(totals.values()).reduce((a, b) => a + b, 0)

  const history = useMemo(() => {
    const byName = new Map<string, { logs: number; people: Set<string>; total: number; last: string | null }>()
    for (const l of data.logs) {
      const h = byName.get(l.task_name) || { logs: 0, people: new Set<string>(), total: 0, last: null }
      h.logs++
      for (const r of data.logMembers.filter((x) => x.task_log_id === l.id)) {
        h.people.add(r.member_id)
        h.total += r.points || 0
      }
      if (l.created_at && (!h.last || l.created_at > h.last)) h.last = l.created_at
      byName.set(l.task_name, h)
    }
    return Array.from(byName.entries()).sort((a, b) => b[1].total - a[1].total)
  }, [data.logs, data.logMembers])

  const shown = data.members.filter((m) => !q || (m.full_name || '').toLowerCase().includes(q.toLowerCase()))
  const blocked = !activityName || !sel.size || !Number.isInteger(parseInt(pts, 10)) || busy

  const log = async () => {
    if (blocked) return
    setBusy(true)
    try {
      await api('/api/admin/activity', {
        method: 'POST',
        body: { ...(act === NEW ? { taskName: activityName } : { templateId: act }), points: p, memberIds: Array.from(sel) },
      })
      showToast('success', `+${p} logged for ${sel.size} member${sel.size > 1 ? 's' : ''}`)
      setSel(new Set())
      setNewName('')
      await refresh()
    } catch (e: any) {
      showToast('error', e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return <div aria-busy="true" className="h-[480px] animate-pulse rounded-xl bg-paper" />
  const chip = (on: boolean) =>
    cn('min-h-[34px] rounded-md border px-3 text-sm transition-colors', on ? 'border-[#4A6BA8] bg-navy text-white' : 'border-control text-text-secondary hover:border-text-tertiary hover:text-text-primary')

  return (
    <>
      <div className="flex flex-wrap items-start gap-x-10 gap-y-7">
        <section aria-labelledby="log" className="flex min-w-0 flex-[1_1_640px] flex-col gap-[22px] rounded-xl bg-paper px-[26px] py-6">
          <h2 id="log" className="text-[22px] font-bold tracking-[-0.01em]">Log points</h2>

          <div>
            <p className="mb-2 text-sm font-semibold">Activity</p>
            <div role="radiogroup" aria-label="Activity" className="flex flex-wrap gap-1.5">
              {data.templates.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={act === t.id} onClick={() => pick(t.id)} className={chip(act === t.id)}>
                  {t.name}
                  {t.description && <span className="opacity-70"> · {t.description}</span>}
                  {lastPoints.has(t.id) && <span className="ml-1.5 font-mono text-xs opacity-70">{lastPoints.get(t.id)}</span>}
                </button>
              ))}
              <button type="button" role="radio" aria-checked={act === NEW} onClick={() => pick(NEW)} className={cn(chip(act === NEW), act !== NEW && 'border-dashed')}>
                + New activity
              </button>
            </div>
            {act === NEW && (
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Mentor at the PAIC 2027 workshop"
                aria-label="New activity name"
                className="mt-2.5 min-h-[40px] w-full rounded-md border border-control bg-ink px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-link focus:outline-none"
              />
            )}
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-sm font-semibold">
                Who <span className="font-mono font-normal text-text-tertiary">{sel.size} selected</span>
              </p>
              <span className="flex gap-3 text-[13px] font-semibold">
                <button type="button" onClick={() => setSel(new Set(data.members.filter((m) => m.role === 'admin').map((m) => m.id)))} className="text-link hover:text-text-primary">Core team</button>
                <button type="button" onClick={() => setSel(new Set(data.members.map((m) => m.id)))} className="text-link hover:text-text-primary">Everyone</button>
                <button type="button" onClick={() => setSel(new Set())} className="text-text-tertiary hover:text-text-primary">Clear</button>
              </span>
            </div>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type a name"
              aria-label="Find members"
              className="mb-2.5 min-h-[40px] w-full rounded-md border border-control bg-ink px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-link focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {shown.map((m) => {
                const on = sel.has(m.id)
                return (
                  <button key={m.id} type="button" aria-pressed={on} onClick={() => toggle(m.id)} className={cn('min-h-[32px] rounded-full border px-2.5 text-[13px]', on ? 'border-[#4A6BA8] bg-navy text-white' : 'border-control text-text-secondary hover:text-text-primary')}>
                    {on && '✓ '}
                    {m.full_name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-3.5 border-t border-[#2A2E37] pt-[18px]">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Points each
              <input
                value={pts}
                onChange={(e) => setPts(e.target.value.replace(/\D/g, '').slice(0, 3))}
                inputMode="numeric"
                className="min-h-[42px] w-[90px] rounded-md border border-control bg-ink px-2.5 text-right font-mono text-base text-text-primary focus:border-link focus:outline-none"
              />
            </label>
            <p className="min-w-0 flex-[1_1_260px] text-sm text-text-tertiary">
              {activityName && sel.size
                ? `“${activityName}” · +${p} each to ${sel.size} member${sel.size > 1 ? 's' : ''} (${p * sel.size} total). Standings update on the right.`
                : !activityName
                  ? 'Pick an activity.'
                  : 'Pick at least one member.'}
            </p>
            <button type="button" onClick={log} disabled={blocked} className={cn(btnPrimary, 'min-h-[44px]')}>
              {busy ? 'Logging…' : sel.size ? `Log for ${sel.size} member${sel.size > 1 ? 's' : ''}` : 'Log points'}
            </button>
          </div>
        </section>

        <aside aria-labelledby="board" className="min-w-0 flex-[0_1_380px]">
          <h2 id="board" className="mb-1 text-[22px] font-bold tracking-[-0.01em]">Standings</h2>
          <p className="mb-3.5 text-sm text-text-tertiary">
            {total.toLocaleString('en-US')} points across {data.logs.length} logged activities
          </p>
          <ol className="flex flex-col gap-2">
            {standings.slice(0, 15).map((s, i) => (
              <li key={s.m.id} className="grid grid-cols-[20px_minmax(0,1fr)_100px_32px] items-center gap-2.5 text-sm">
                <span className="font-mono text-xs text-text-disabled">{i + 1}</span>
                <span className="truncate">{s.m.full_name}</span>
                <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-[3px] bg-rule">
                  <span className={cn('block h-full', s.now > s.base ? 'bg-signal' : 'bg-[#5B7FD6]')} style={{ width: `${Math.round((s.now / max) * 100)}%` }} />
                </span>
                <span className="text-right font-mono">{s.now}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <section aria-labelledby="hist" className="mt-11">
        <h2 id="hist" className="mb-2 text-[22px] font-bold tracking-[-0.01em]">By activity</h2>
        <ul className="border-b border-rule">
          {history.map(([name, h]) => (
            <li key={name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 border-t border-rule px-1.5 py-3 text-[15px] md:grid-cols-[minmax(0,1fr)_110px_120px_120px_80px]">
              <span className="min-w-0 truncate font-semibold">{name}</span>
              <span className="text-right font-mono md:order-last">{h.total}</span>
              <span className="text-sm text-text-tertiary">{h.logs} log{h.logs > 1 ? 's' : ''}</span>
              <span className="text-sm text-text-tertiary">{h.people.size} {h.people.size === 1 ? 'person' : 'people'}</span>
              <span className="hidden text-sm text-text-tertiary md:block">{h.last ? formatDay(h.last) : '—'}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-text-disabled">Logs from before 2026-10 have no date. New logs record when and by whom.</p>
      </section>
    </>
  )
}
