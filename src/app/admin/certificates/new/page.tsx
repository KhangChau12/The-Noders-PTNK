'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'
import { btnPrimary, fieldClass, labelClass } from '@/components/dashboard/ui'
import { AWARD_RANK, AWARD_SHORT, STYLE_AWARDS, certificateTitle, type Award, type AwardStyle } from '@/lib/awards'
import { CONTESTS } from '@/lib/programs'
import { uploadImage, uploadPdf } from '@/lib/upload'
import { cn } from '@/lib/utils'

interface Row {
  key: string
  file: File
  preview: string | null
  memberId: string | null
  how: 'exact' | 'accents' | 'close' | 'picked' | null
  award: Award
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim()

/** "Nguyễn Ngọc Minh Tâm.png", "truong-hoang-tan-dung.png", "TranPhucThai_cert.png" → a member. */
function matchMember(fileName: string, members: { id: string; full_name: string | null }[]) {
  const base = fileName.replace(/\.[^.]+$/, '')
  const spaced = base.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_\-.]+/g, ' ')
  const words = norm(spaced).split(' ').filter((w) => w && !['cert', 'certificate', 'final', 'png', 'jpg'].includes(w))
  const cleaned = words.join(' ')
  const hadAccents = /[^\x00-\x7F]/.test(base)
  for (const m of members) {
    const n = norm(m.full_name || '')
    if (n && n === cleaned) return { id: m.id, how: hadAccents ? ('accents' as const) : ('exact' as const) }
  }
  for (const m of members) {
    const tokens = norm(m.full_name || '').split(' ')
    if (tokens.length > 1 && tokens.every((t) => words.includes(t))) return { id: m.id, how: 'close' as const }
    if (tokens.join('') && tokens.join('') === words.join('')) return { id: m.id, how: 'close' as const }
  }
  return { id: null, how: null }
}

export default function IssueBatchPage() {
  return (
    <Suspense>
      <IssueBatch />
    </Suspense>
  )
}

function IssueBatch() {
  const { data, ready, refresh, api } = useAdmin()
  const { session } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const params = useSearchParams()
  const existing = (data.batches || []).find((b) => b.id === params.get('batch')) || null

  const [contest, setContest] = useState('')
  const [eventName, setEventName] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [style, setStyle] = useState<AwardStyle>('places')
  const [rows, setRows] = useState<Row[]>([])
  const [dragging, setDragging] = useState(false)
  const [logPoints, setLogPoints] = useState(true)
  const [templateId, setTemplateId] = useState('')
  const [points, setPoints] = useState('')
  const [progress, setProgress] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (existing) {
      setEventName(existing.event_name)
      setContest(existing.contest_slug || '')
      setStyle(existing.award_style)
      setDate(existing.issued_at.slice(0, 10))
    }
  }, [existing])

  // Suggest the "Participate in …" activity for the chosen contest
  useEffect(() => {
    const c = CONTESTS.find((x) => x.slug === contest)
    const t = c ? data.templates.find((x) => x.name.toLowerCase() === `participate in ${c.shortName.toLowerCase()}`) : null
    if (t) {
      setTemplateId(t.id)
      const last = data.logs.filter((l) => l.task_template_id === t.id).slice(-1)[0]
      setPoints(String(last?.points ?? 15))
    }
  }, [contest, data.templates, data.logs])

  const awards = STYLE_AWARDS[style]
  useEffect(() => {
    setRows((rs) => rs.map((r) => (awards.includes(r.award) ? r : { ...r, award: 'participation' })))
  }, [style]) // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = (list: FileList | File[] | null) => {
    if (!list) return
    const files = Array.from(list).filter((f) => /^(image\/|application\/pdf)/.test(f.type))
    setRows((rs) => [
      ...rs,
      ...files.map((file) => {
        const m = matchMember(file.name, data.members)
        return {
          key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          memberId: m.id,
          how: m.how,
          award: 'participation' as Award,
        }
      }),
    ])
  }

  const nextIndex = useMemo(
    () => data.certificates.reduce((m, c) => Math.max(m, /^C(\d{4})$/.test(c.certificate_id) ? parseInt(c.certificate_id.slice(1), 10) : -1), -1) + 1,
    [data.certificates]
  )

  // Winners first, then participants: that's the code order the server uses
  const ordered = useMemo(() => rows.map((r, i) => ({ r, i })).sort((a, b) => AWARD_RANK[a.r.award] - AWARD_RANK[b.r.award] || a.i - b.i).map((x) => x.r), [rows])
  const codeOf = new Map<string, string>()
  ordered.filter((r) => r.memberId).forEach((r, i) => codeOf.set(r.key, `C${String(nextIndex + i).padStart(4, '0')}`))

  const matched = rows.filter((r) => r.memberId).length
  const unmatched = rows.length - matched
  const dupes = rows.filter((r, i) => r.memberId && rows.findIndex((x) => x.memberId === r.memberId) !== i).length
  const winners = rows.filter((r) => r.memberId && r.award !== 'participation').length
  const name = existing ? existing.event_name : eventName.trim()
  const blocked = !rows.length || !!unmatched || !!dupes || !name || !!progress || data.batches === null
  const firstWinner = ordered.find((r) => r.award !== 'participation')

  const issue = async () => {
    if (blocked || !session?.access_token) return
    try {
      const uploaded: { user_id: string; award: Award; file_url: string; file_type: 'image' | 'pdf'; image_id: string }[] = []
      let n = 0
      for (const r of ordered) {
        setProgress(`Uploading ${++n} of ${rows.length}…`)
        const isPdf = r.file.type === 'application/pdf'
        const up = isPdf ? await uploadPdf(r.file, session.access_token) : await uploadImage(r.file, 'certificate', session.access_token)
        uploaded.push({ user_id: r.memberId!, award: r.award, file_url: up.public_url, file_type: isPdf ? 'pdf' : 'image', image_id: up.id })
      }
      setProgress('Issuing…')
      const res = await api('/api/admin/certificates/batch', {
        method: 'POST',
        body: existing
          ? { batch_id: existing.id, items: uploaded }
          : { event_name: name, contest_slug: contest || null, award_style: style, issued_at: `${date}T12:00:00.000Z`, items: uploaded },
      })
      const p = parseInt(points, 10)
      if (logPoints && templateId && Number.isInteger(p)) {
        setProgress('Logging points…')
        await api('/api/admin/activity', { method: 'POST', body: { templateId, points: p, memberIds: Array.from(new Set(uploaded.map((u) => u.user_id))) } })
      }
      showToast('success', `${res.certificates?.length || uploaded.length} certificates issued`)
      await refresh()
      router.push('/admin/certificates')
    } catch (e: any) {
      showToast('error', e.message)
      setProgress(null)
    }
  }

  if (!ready) return <div aria-busy="true" className="h-[480px] animate-pulse rounded-xl bg-paper" />

  const card = 'rounded-xl bg-paper px-6 py-[22px]'
  const step = (n: number) => <span className="font-mono font-normal text-text-tertiary">{n} </span>

  return (
    <>
      <Link href="/admin/certificates" className="mb-3.5 inline-block text-[15px] text-text-secondary hover:text-text-primary">← Certificates</Link>
      <h2 className="mb-1 text-[28px] font-bold tracking-[-0.02em]">{existing ? `Add to ${existing.event_name}` : 'Issue a batch'}</h2>
      <p className="mb-7 max-w-[720px] text-text-tertiary">
        One batch is one event. Drop everyone’s file at once — participants and winners together — and set the award on the few that won.
        Files named after each person are matched to members automatically.
      </p>
      {data.batches === null && (
        <p className="mb-6 rounded-lg bg-[#1E1A12] px-4 py-3 text-sm text-signal">Run migration 027 before issuing: batches and awards are stored in its new columns.</p>
      )}

      <div className="flex flex-wrap items-start gap-x-10 gap-y-7">
        <div className="flex min-w-0 flex-[1_1_780px] flex-col gap-7">
          <section aria-labelledby="s1" className={card}>
            <h3 id="s1" className="mb-3.5 text-[17px] font-bold">{step(1)}The event</h3>
            {existing ? (
              <p className="text-text-secondary">
                Adding to <b className="text-text-primary">{existing.event_name}</b>, issued {existing.issued_at.slice(0, 10)}. New files get the next codes.
              </p>
            ) : (
              <>
                <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_200px_170px]">
                  <div>
                    <label htmlFor="ev" className={labelClass}>Event</label>
                    <input id="ev" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. PTNK AI Challenge 2026" className={cn(fieldClass, 'min-h-[44px] bg-ink')} />
                  </div>
                  <div>
                    <label htmlFor="ct" className={labelClass}>Contest page</label>
                    <select
                      id="ct"
                      value={contest}
                      onChange={(e) => {
                        setContest(e.target.value)
                        const c = CONTESTS.find((x) => x.slug === e.target.value)
                        if (c && !eventName) setEventName(c.title)
                      }}
                      className={cn(fieldClass, 'min-h-[44px] bg-ink')}
                    >
                      <option value="">None</option>
                      {CONTESTS.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.shortName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cd" className={labelClass}>Issue date</label>
                    <input id="cd" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(fieldClass, 'min-h-[44px] bg-ink font-mono [color-scheme:dark]')} />
                  </div>
                </div>
                <div className="mt-4">
                  <span className={labelClass}>Awards in this event</span>
                  <div role="radiogroup" aria-label="Award style" className="inline-flex flex-wrap gap-1 rounded-lg bg-ink p-1">
                    {([['places', '1st · 2nd · 3rd'], ['medals', 'Gold · Silver · Bronze'], ['none', 'Participation only']] as [AwardStyle, string][]).map(([s, l]) => (
                      <button key={s} type="button" role="radio" aria-checked={style === s} onClick={() => setStyle(s)} className={cn('min-h-[34px] rounded-md px-3 text-sm', style === s ? 'bg-navy text-white' : 'text-text-secondary hover:text-text-primary')}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[13px] text-text-tertiary">Everyone starts as Participation; pick an award only for the winners below.</p>
                </div>
              </>
            )}
          </section>

          <section aria-labelledby="s2" className={card}>
            <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
              <h3 id="s2" className="text-[17px] font-bold">{step(2)}Files, people and awards</h3>
              {rows.length > 0 && (
                <span className={cn('text-sm', unmatched || dupes ? 'text-signal' : 'text-[#6FD39F]')}>
                  {unmatched ? `${matched} of ${rows.length} matched · ${unmatched} need${unmatched === 1 ? 's' : ''} a member` : dupes ? 'Someone is listed twice' : `All ${rows.length} matched`}
                </span>
              )}
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
              className={cn('mb-2 rounded-[10px] border border-dashed px-4 py-5 text-center text-sm text-text-tertiary', dragging ? 'border-link bg-navy/20' : 'border-control')}
            >
              Drop PNG, JPG or PDF files here, or{' '}
              <button type="button" onClick={() => fileRef.current?.click()} className="font-semibold text-link hover:text-text-primary">browse</button>
              <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="sr-only" tabIndex={-1} onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
            </div>

            {rows.length > 0 && (
              <ul>
                {ordered.map((r) => (
                  <li key={r.key} className="grid grid-cols-[56px_minmax(0,1fr)_28px] items-center gap-x-3 gap-y-2 border-t border-rule py-[9px] text-sm md:grid-cols-[56px_minmax(0,1fr)_minmax(0,1fr)_auto_64px_28px]">
                    {r.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.preview} alt="" className="aspect-[2000/1414] w-14 rounded object-cover" />
                    ) : (
                      <span className="flex aspect-[2000/1414] w-14 items-center justify-center rounded bg-ink font-mono text-[10px] text-text-tertiary">PDF</span>
                    )}
                    <span className="min-w-0 truncate font-mono text-xs text-text-secondary">{r.file.name}</span>
                    <button type="button" aria-label={`Remove ${r.file.name}`} onClick={() => setRows(rows.filter((x) => x.key !== r.key))} className="h-7 w-7 text-text-disabled hover:text-text-primary md:order-last">×</button>
                    <span className="col-span-3 min-w-0 md:col-span-1">
                      <select
                        value={r.memberId || ''}
                        onChange={(e) => setRows(rows.map((x) => (x.key === r.key ? { ...x, memberId: e.target.value || null, how: e.target.value ? 'picked' : null } : x)))}
                        aria-label={`Member for ${r.file.name}`}
                        className={cn('min-h-[34px] w-full rounded-md border bg-ink px-2 text-sm focus:border-link focus:outline-none', r.memberId ? 'border-control text-text-primary' : 'border-[#5C4A26] text-signal')}
                      >
                        <option value="">Pick a member…</option>
                        {data.members.map((m) => (
                          <option key={m.id} value={m.id}>{m.full_name}</option>
                        ))}
                      </select>
                      {r.how && r.how !== 'picked' && (
                        <span className={cn('mt-0.5 block text-xs', r.how === 'close' ? 'text-signal' : 'text-[#6FD39F]')}>
                          {r.how === 'exact' ? 'exact name' : r.how === 'accents' ? 'accents ignored' : 'close match — check'}
                        </span>
                      )}
                    </span>
                    <span role="group" aria-label={`Award for ${r.file.name}`} className="col-span-2 flex flex-wrap gap-1 md:col-span-1">
                      {awards.map((a) => {
                        const on = r.award === a
                        const win = a !== 'participation'
                        return (
                          <button
                            key={a}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setRows(rows.map((x) => (x.key === r.key ? { ...x, award: a } : x)))}
                            className={cn(
                              'min-h-[28px] rounded-full border px-2 text-xs',
                              on ? (win ? 'border-[#8A6A2E] bg-[#3A2E14] text-[#F2CF7A]' : 'border-[#4A6BA8] bg-navy text-white') : 'border-control text-text-tertiary hover:text-text-primary'
                            )}
                          >
                            {AWARD_SHORT[a]}
                          </button>
                        )
                      })}
                    </span>
                    <span className={cn('font-mono text-[13px]', codeOf.get(r.key) ? 'text-text-primary' : 'text-text-disabled')}>{codeOf.get(r.key) || '—'}</span>
                  </li>
                ))}
              </ul>
            )}
            {name && (
              <p className="mt-3 text-[13px] text-text-tertiary">
                Each title is built from its award and the event, e.g. <span className="text-text-primary">“{certificateTitle(firstWinner?.award || 'participation', name)}”</span>. Winners get the first codes.
              </p>
            )}
          </section>

          <section aria-labelledby="s3" className={card}>
            <h3 id="s3" className="mb-3 text-[17px] font-bold">{step(3)}Also, while you’re here</h3>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={logPoints} onChange={() => setLogPoints(!logPoints)} className="mt-1 h-[18px] w-[18px] accent-[#5B7FD6]" />
              <span className="flex flex-col gap-2">
                <span className="font-semibold">Log club points for the same people</span>
                {logPoints && (
                  <span className="flex flex-wrap items-center gap-2 text-sm">
                    <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} aria-label="Activity" className="min-h-[34px] max-w-full rounded-md border border-control bg-ink px-2 text-text-primary focus:border-link focus:outline-none">
                      <option value="">Choose an activity…</option>
                      {data.templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <input value={points} onChange={(e) => setPoints(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" aria-label="Points each" placeholder="pts" className="min-h-[34px] w-16 rounded-md border border-control bg-ink px-2 text-right font-mono text-text-primary focus:border-link focus:outline-none" />
                    <span className="text-text-tertiary">each</span>
                  </span>
                )}
              </span>
            </label>
          </section>
        </div>

        <aside className="flex min-w-0 flex-[0_1_320px] flex-col gap-3.5 rounded-xl bg-paper px-6 py-[22px] lg:sticky lg:top-[100px]">
          <h3 className="text-[17px] font-bold">Ready to issue</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2 text-sm">
            <dt className="text-text-tertiary">Certificates</dt>
            <dd className="text-right font-mono">{matched}</dd>
            <dt className="text-text-tertiary">Awards</dt>
            <dd className="text-right font-mono">{winners} winner{winners === 1 ? '' : 's'} · {matched - winners} participation</dd>
            <dt className="text-text-tertiary">Codes</dt>
            <dd className="text-right font-mono">
              {matched ? `C${String(nextIndex).padStart(4, '0')}${matched > 1 ? `–C${String(nextIndex + matched - 1).padStart(4, '0')}` : ''}` : '—'}
            </dd>
            <dt className="text-text-tertiary">Points</dt>
            <dd className="text-right font-mono">{logPoints && templateId && points ? `+${points} × ${new Set(rows.map((r) => r.memberId).filter(Boolean)).size}` : 'not logged'}</dd>
          </dl>
          <button type="button" onClick={issue} disabled={blocked} className={cn(btnPrimary, 'min-h-[48px]')}>
            {progress || (!rows.length ? 'Add files first' : unmatched ? 'Match every file first' : dupes ? 'Remove the duplicate' : !name ? 'Name the event' : `Issue ${matched} certificate${matched > 1 ? 's' : ''}`)}
          </button>
          <p className="text-[13px] text-text-tertiary">Each person sees theirs on their dashboard right away. You can add late files to this batch later — they get the next codes.</p>
        </aside>
      </div>
    </>
  )
}
