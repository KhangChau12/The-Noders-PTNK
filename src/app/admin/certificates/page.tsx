'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { useAdmin } from '@/components/admin/AdminContext'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { btnPrimary } from '@/components/dashboard/ui'
import { AdminCertificate, awardOf, certificateGroups, nameOf } from '@/lib/admin'
import { AWARD_RANK, AWARD_SHORT, AWARD_TONE, type Award } from '@/lib/awards'
import { describeCertificate, formatDay } from '@/lib/dashboard'
import { uploadImage, uploadPdf } from '@/lib/upload'
import { cn } from '@/lib/utils'

export default function CertificatesAdminPage() {
  const { data, ready, patch, api } = useAdmin()
  const { session } = useAuth()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const replacing = useRef<AdminCertificate | null>(null)

  const groups = useMemo(() => certificateGroups(data, (c) => describeCertificate(c)), [data])
  const nextCode = useMemo(() => {
    const max = data.certificates.reduce((m, c) => Math.max(m, /^C(\d{4})$/.test(c.certificate_id) ? parseInt(c.certificate_id.slice(1), 10) : -1), -1)
    return `C${String(max + 1).padStart(4, '0')}`
  }, [data.certificates])

  const match = (c: AdminCertificate) => {
    if (!q) return true
    const s = q.toLowerCase()
    return c.certificate_id.toLowerCase().includes(s) || nameOf(data, c.user_id).toLowerCase().includes(s)
  }

  const revoke = async (c: AdminCertificate) => {
    const ok = await confirm({
      title: `Revoke ${c.certificate_id}?`,
      message: `${nameOf(data, c.user_id)}’s certificate is deleted and its verify page will say “not found”. This can’t be undone.`,
      confirmText: 'Revoke',
      cancelText: 'Keep',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await api(`/api/admin/certificates/${c.id}`, { method: 'DELETE' })
      patch((d) => ({ ...d, certificates: d.certificates.filter((x) => x.id !== c.id) }))
      showToast('success', `${c.certificate_id} revoked`)
    } catch (e: any) {
      showToast('error', e.message)
    }
  }

  const replace = async (file?: File) => {
    const c = replacing.current
    if (!file || !c || !session?.access_token) return
    setBusy(c.id)
    try {
      const isPdf = file.type === 'application/pdf'
      const up = isPdf ? await uploadPdf(file, session.access_token) : await uploadImage(file, 'certificate', session.access_token)
      await api(`/api/admin/certificates/${c.id}`, { method: 'PUT', body: { file_url: up.public_url, image_id: up.id, file_type: isPdf ? 'pdf' : 'image' } })
      patch((d) => ({ ...d, certificates: d.certificates.map((x) => (x.id === c.id ? { ...x, file_url: up.public_url, file_type: isPdf ? 'pdf' : 'image' } : x)) }))
      showToast('success', `File for ${c.certificate_id} replaced`)
    } catch (e: any) {
      showToast('error', e.message)
    } finally {
      setBusy(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (!ready) return <div aria-busy="true" className="h-[480px] animate-pulse rounded-xl bg-paper" />

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.01em]">Certificates</h2>
          <p className="mt-0.5 text-sm text-text-tertiary">
            {data.certificates.length} issued in {groups.length} batch{groups.length === 1 ? '' : 'es'} · next code{' '}
            <span className="font-mono text-text-primary">{nextCode}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Code or member"
            aria-label="Find a certificate"
            className="min-h-[40px] w-[220px] max-w-full rounded-md border border-control bg-paper px-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-link focus:outline-none"
          />
          <Link href="/admin/certificates/new" className={btnPrimary}>Issue a batch</Link>
        </div>
      </div>

      {data.batches === null && (
        <p className="mb-5 rounded-lg bg-[#1E1A12] px-4 py-3 text-sm text-signal">
          Batches are read from titles until migration 027 is run. Issuing new batches needs it.
        </p>
      )}

      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="sr-only" tabIndex={-1} onChange={(e) => replace(e.target.files?.[0])} />

      <div className="flex flex-col gap-4">
        {groups.map((g) => {
          const certs = g.certs.filter(match).sort((a, b) => AWARD_RANK[awardOf(a)] - AWARD_RANK[awardOf(b)] || a.certificate_id.localeCompare(b.certificate_id))
          if (!certs.length) return null
          const isOpen = q ? true : !!open[g.key]
          const codes = g.certs.map((c) => c.certificate_id).sort()
          const mix = new Map<Award, number>()
          g.certs.forEach((c) => mix.set(awardOf(c), (mix.get(awardOf(c)) || 0) + 1))
          const types = Array.from(new Set(g.certs.map((c) => c.file_type || 'image')))
          return (
            <article key={g.key} className="overflow-hidden rounded-xl bg-paper">
              <button
                type="button"
                onClick={() => setOpen({ ...open, [g.key]: !isOpen })}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-[20px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2 px-5 py-[18px] text-left sm:grid-cols-[20px_minmax(0,1fr)_auto]"
              >
                <span aria-hidden="true" className="text-text-tertiary">{isOpen ? '▾' : '▸'}</span>
                <span className="min-w-0">
                  <span className="block text-[17px] font-bold">{g.name}</span>
                  <span className="block text-sm text-text-tertiary">
                    {formatDay(g.issuedAt)} · {g.certs.length} certificate{g.certs.length > 1 ? 's' : ''} · {codes[0]}
                    {codes.length > 1 && `–${codes[codes.length - 1]}`} · {types.join(', ')}
                  </span>
                </span>
                <span className="col-start-2 flex flex-wrap gap-1.5 sm:col-start-auto sm:justify-end">
                  {Array.from(mix.entries())
                    .sort((a, b) => AWARD_RANK[a[0]] - AWARD_RANK[b[0]])
                    .map(([a, n]) => (
                      <span key={a} className="rounded-full bg-ink px-2.5 py-[3px] text-[13px]" style={{ color: AWARD_TONE[a] }}>
                        {n} {AWARD_SHORT[a].toLowerCase()}
                      </span>
                    ))}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-3 sm:pl-[54px]">
                  <ul>
                    {certs.map((c) => {
                      const a = awardOf(c)
                      return (
                        <li key={c.id} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-1 border-t border-rule px-1.5 py-[9px] text-sm hover:bg-[#12151B] md:grid-cols-[72px_110px_minmax(0,1fr)_230px]">
                          <span className="font-mono">{c.certificate_id}</span>
                          <span className="hidden md:block" style={{ color: AWARD_TONE[a] }}>{AWARD_SHORT[a]}</span>
                          <span className="min-w-0 truncate">{nameOf(data, c.user_id)}</span>
                          <span className="col-span-2 flex justify-start gap-3.5 font-semibold md:col-span-1 md:justify-end">
                            <Link href={`/verify/${c.certificate_id}`} className="text-link hover:text-text-primary">Public page</Link>
                            <button type="button" disabled={busy === c.id} onClick={() => { replacing.current = c; fileRef.current?.click() }} className="text-text-secondary hover:text-text-primary">
                              {busy === c.id ? 'Uploading…' : 'Replace file'}
                            </button>
                            <button type="button" onClick={() => revoke(c)} className="text-text-tertiary hover:text-[#FF9C85]">Revoke…</button>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  {g.batchId && (
                    <Link href={`/admin/certificates/new?batch=${g.batchId}`} className={cn('mt-3 inline-block text-sm font-semibold text-link hover:text-text-primary')}>
                      + Add files to this batch
                    </Link>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}
