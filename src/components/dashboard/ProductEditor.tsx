'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { RichText, cleanHtml, plainText } from '@/components/RichText'
import { CONTAINER_CLASS, youtubeId } from '@/components/editorial'
import { createClient } from '@/lib/supabase'
import { projectQueries } from '@/lib/queries'
import { uploadImage } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { useDashboard } from './DashboardContext'
import { MemberAvatar, btnPrimary, btnSecondary, fieldClass, hintClass, labelClass } from './ui'

interface Member {
  id: string
  full_name: string | null
  username: string
  avatar_url: string | null
}

interface Credit {
  user_id: string
  role_in_project: string
  contribution_percentage: number
}

interface Form {
  title: string
  description: string
  details: string
  status: 'active' | 'archived'
  tech_stack: string[]
  demo_url: string
  repo_url: string
  video_url: string
  thumbnail_url: string
  thumbnail_image_id: string | null
  credits: Credit[] // everyone except the creator
}

const EMPTY: Form = {
  title: '',
  description: '',
  details: '',
  status: 'active',
  tech_stack: [],
  demo_url: '',
  repo_url: '',
  video_url: '',
  thumbnail_url: '',
  thumbnail_image_id: null,
  credits: [],
}

const DESC_MAX = 160



function urlProblem(v: string) {
  if (!v) return null
  try {
    return /^https?:$/.test(new URL(v).protocol) ? null : 'Start with https://'
  } catch {
    return 'Start with https://'
  }
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter()
  const { user, session, isAdmin } = useAuth()
  const { refresh } = useDashboard()
  const { showToast } = useToast()
  const { confirm } = useConfirm()

  const [initial, setInitial] = useState<Form | null>(productId ? null : EMPTY)
  const [form, setForm] = useState<Form | null>(productId ? null : EMPTY)
  const [createdBy, setCreatedBy] = useState<string | null>(productId ? null : user?.id || null)
  const [members, setMembers] = useState<Member[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tech, setTech] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Load the product and the member directory in parallel
  useEffect(() => {
    const supabase: any = createClient()
    const people = supabase.from('profiles').select('id, full_name, username, avatar_url').order('full_name')
    const product = productId
      ? supabase
          .from('projects')
          .select(`*, project_contributors(user_id, role_in_project, contribution_percentage),
            thumbnail_image:images!projects_thumbnail_image_id_fkey(public_url)`)
          .eq('id', productId)
          .single()
      : Promise.resolve(null)
    Promise.all([people, product]).then(([pe, pr]: any[]) => {
      setMembers(pe.data || [])
      if (!productId) return
      if (pr?.error || !pr?.data) {
        setLoadError('This product doesn’t exist or was deleted.')
        return
      }
      const p = pr.data
      const f: Form = {
        title: p.title || '',
        description: p.description || '',
        details: p.details || '',
        status: p.status || 'active',
        tech_stack: p.tech_stack || [],
        demo_url: p.demo_url || '',
        repo_url: p.repo_url || '',
        video_url: p.video_url || '',
        thumbnail_url: p.thumbnail_image?.public_url || p.thumbnail_url || '',
        thumbnail_image_id: p.thumbnail_image_id || null,
        credits: (p.project_contributors || [])
          .filter((c: any) => c.user_id !== p.created_by)
          .map((c: any) => ({ user_id: c.user_id, role_in_project: c.role_in_project || 'Contributor', contribution_percentage: c.contribution_percentage || 0 })),
      }
      setCreatedBy(p.created_by)
      setInitial(f)
      setForm(f)
    })
  }, [productId])

  useEffect(() => {
    if (!createdBy && user?.id && !productId) setCreatedBy(user.id)
  }, [user?.id, createdBy, productId])

  const dirty = !!form && !!initial && JSON.stringify(form) !== JSON.stringify(initial)
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  const byId = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])

  if (loadError) {
    return (
      <EditorFrame title="Product" status={null}>
        <p className="text-text-secondary">{loadError}</p>
        <Link href="/dashboard/products" className="mt-4 inline-block font-semibold text-link">← Back to your products</Link>
      </EditorFrame>
    )
  }
  if (!form || !user) {
    return (
      <EditorFrame title={productId ? 'Loading…' : 'New product'} status={null}>
        <div aria-busy="true" className="h-[600px] animate-pulse rounded-[14px] bg-paper" />
      </EditorFrame>
    )
  }

  const isCreator = !productId || createdBy === user.id
  const canManageTeam = isCreator
  const canChangeStatus = isCreator || isAdmin

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f))

  // Shares: the creator gets whatever the others don't
  const othersTotal = form.credits.reduce((s, c) => s + (Number(c.contribution_percentage) || 0), 0)
  const creatorShare = 100 - othersTotal
  const shareProblem =
    othersTotal > 100
      ? `Shares add up to ${othersTotal}% before your own — lower someone’s share.`
      : form.credits.some((c) => !c.contribution_percentage)
        ? 'Every credited member needs a share above 0%.'
        : null

  const errors = {
    title: !form.title.trim() ? 'Give it a name.' : null,
    description: !form.description.trim() ? 'One line on what it does.' : form.description.length > DESC_MAX ? `Keep it under ${DESC_MAX} characters.` : null,
    demo_url: urlProblem(form.demo_url),
    repo_url: urlProblem(form.repo_url),
    video_url: urlProblem(form.video_url),
    team: shareProblem,
  }
  const invalid = Object.values(errors).some(Boolean)
  const hasWriteup = plainText(form.details).length > 40
  const videoOk = !!youtubeId(form.video_url)

  const toc = [
    { id: 'basics', label: 'Basics', state: errors.title || errors.description ? 'fix' : 'ok' },
    { id: 'links', label: 'Links', state: errors.demo_url || errors.repo_url ? 'fix' : form.demo_url ? 'ok' : 'missing' },
    { id: 'media', label: 'Screenshot & video', state: errors.video_url ? 'fix' : form.thumbnail_url && form.video_url ? 'ok' : 'missing' },
    { id: 'writeup', label: 'Write-up', state: hasWriteup ? 'ok' : 'empty' },
    { id: 'team', label: 'Team', state: errors.team ? 'fix' : 'ok' },
  ]

  const onScreenshot = async (file?: File) => {
    if (!file || !session?.access_token) return
    try {
      setUploading(true)
      const img = await uploadImage(file, 'project_thumbnail', session.access_token)
      setForm((f) => (f ? { ...f, thumbnail_url: img.public_url, thumbnail_image_id: img.id } : f))
    } catch (e: any) {
      showToast('error', e.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const addTech = (raw: string) => {
    const t = raw.trim().replace(/,$/, '')
    if (t && !form.tech_stack.some((x) => x.toLowerCase() === t.toLowerCase())) set('tech_stack', [...form.tech_stack, t])
    setTech('')
  }

  const save = async () => {
    if (invalid || saving) return
    setSaving(true)
    const payload: any = {
      title: form.title.trim(),
      description: form.description.trim(),
      details: cleanHtml(form.details),
      tech_stack: form.tech_stack,
      demo_url: form.demo_url || null,
      repo_url: form.repo_url || null,
      video_url: form.video_url || null,
      thumbnail_url: form.thumbnail_url || null,
      thumbnail_image_id: form.thumbnail_image_id,
    }
    if (canChangeStatus) payload.status = form.status
    if (canManageTeam) payload.contributors = form.credits.map((c) => ({ ...c, contribution_percentage: Number(c.contribution_percentage) }))

    const result = productId
      ? await projectQueries.updateProject(productId, payload, session)
      : await projectQueries.createProject(payload, session)
    setSaving(false)
    if (result.error) {
      showToast('error', result.error.message)
      return
    }
    setInitial(form)
    refresh()
    if (!productId && result.project?.id) {
      showToast('success', 'Product added')
      router.replace(`/dashboard/products/${result.project.id}/edit`)
    } else {
      showToast('success', 'Saved')
    }
  }

  const remove = async () => {
    if (!productId) return
    const ok = await confirm({
      title: 'Delete this product?',
      message: `“${form.title}” and its credits will disappear from every member’s profile. This can’t be undone.`,
      confirmText: 'Delete product',
      cancelText: 'Keep it',
      variant: 'danger',
    })
    if (!ok) return
    const { error } = await projectQueries.deleteProject(productId, session)
    if (error) return showToast('error', error.message)
    await refresh()
    showToast('success', 'Product deleted')
    router.push('/dashboard/products')
  }

  const status = saving
    ? { text: 'Saving…', tone: 'text-signal' }
    : invalid && dirty
      ? { text: 'Fix the highlighted fields to save', tone: 'text-[#FF9C85]' }
      : dirty
        ? { text: productId ? 'Unsaved changes' : 'Not saved yet', tone: 'text-signal' }
        : { text: productId ? 'All changes saved' : 'Not saved yet', tone: 'text-text-tertiary' }

  const available = members.filter((m) => m.id !== createdBy && !form.credits.some((c) => c.user_id === m.id))

  return (
    <EditorFrame
      title={form.title || 'New product'}
      status={status}
      actions={
        <>
          {productId && (
            <Link href={`/products/${productId}`} target="_blank" className="hidden px-2.5 py-2 text-sm font-semibold sm:inline text-text-secondary hover:text-text-primary">
              Preview page ↗
            </Link>
          )}
          <button type="button" onClick={save} disabled={invalid || saving || (!dirty && !!productId)} className={btnPrimary}>
            {productId ? 'Save' : 'Add product'}
          </button>
        </>
      }
    >
      <div className="flex flex-wrap items-start gap-x-14 gap-y-8">
        <nav aria-label="Sections" className="min-w-0 flex-[0_1_220px] text-[15px] lg:sticky lg:top-[150px]">
          <ol className="flex flex-col gap-0.5">
            {toc.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex justify-between rounded-md px-3 py-2 text-text-secondary hover:bg-white/[0.04] hover:text-white">
                  {s.label}
                  <span
                    className={cn(
                      'text-[13px]',
                      s.state === 'ok' ? 'text-[#6FD39F]' : s.state === 'fix' ? 'text-[#FF9C85]' : 'text-signal'
                    )}
                  >
                    {s.state === 'ok' ? '✓' : s.state === 'fix' ? 'fix' : s.state}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <form onSubmit={(e) => { e.preventDefault(); save() }} className="flex min-w-0 max-w-[760px] flex-[1_1_640px] flex-col gap-14">
          <section id="basics" className="scroll-mt-40 flex flex-col gap-[18px]">
            <h2 className="text-[22px] font-bold">Basics</h2>
            <div>
              <label htmlFor="title" className={labelClass}>Name</label>
              <input id="title" value={form.title} onChange={(e) => set('title', e.target.value)} aria-invalid={!!errors.title && dirty} className={cn(fieldClass, 'min-h-[48px] text-[17px] font-semibold')} />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between">
                <label htmlFor="desc" className="text-sm font-semibold">One-line description</label>
                <span className={cn('font-mono text-[13px]', form.description.length > DESC_MAX ? 'text-[#FF9C85]' : 'text-text-disabled')}>
                  {form.description.length}/{DESC_MAX}
                </span>
              </div>
              <textarea id="desc" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} className={cn(fieldClass, 'resize-y py-3')} />
              <p className={hintClass}>Shown on cards and at the top of the product page.</p>
            </div>
            {canChangeStatus && productId && (
              <div>
                <span className="mb-2 block text-sm font-semibold">Status</span>
                <div role="radiogroup" aria-label="Status" className="inline-flex gap-1 rounded-lg bg-paper p-1">
                  {(['active', 'archived'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={form.status === s}
                      onClick={() => set('status', s)}
                      className={cn('min-h-[36px] rounded-md px-3.5 text-sm font-medium', form.status === s ? 'bg-navy text-white' : 'text-text-secondary hover:text-text-primary')}
                    >
                      {s === 'active' ? 'Live' : 'Archived'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label htmlFor="stack" className={labelClass}>Built with</label>
              <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-control bg-paper px-2.5 py-2 focus-within:border-link">
                {form.tech_stack.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('tech_stack', form.tech_stack.filter((x) => x !== t))}
                    aria-label={`Remove ${t}`}
                    className="rounded bg-rule px-2 py-[3px] text-[13px] text-text-primary hover:bg-control"
                  >
                    {t} ×
                  </button>
                ))}
                <input
                  id="stack"
                  value={tech}
                  placeholder={form.tech_stack.length ? 'Add…' : 'Python, FastAPI, React…'}
                  onChange={(e) => (e.target.value.endsWith(',') ? addTech(e.target.value) : setTech(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTech(tech)
                    } else if (e.key === 'Backspace' && !tech && form.tech_stack.length) {
                      set('tech_stack', form.tech_stack.slice(0, -1))
                    }
                  }}
                  onBlur={() => tech && addTech(tech)}
                  className="min-h-[30px] min-w-[80px] flex-[1_1_100px] bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none"
                />
              </div>
              <p className={hintClass}>Press Enter or comma after each one.</p>
            </div>
          </section>

          <section id="links" className="scroll-mt-40 flex flex-col gap-4">
            <h2 className="text-[22px] font-bold">Links</h2>
            <UrlField id="live" label="Live URL" value={form.demo_url} onChange={(v) => set('demo_url', v)} error={errors.demo_url}
              missing={!form.demo_url ? 'missing — visitors can’t try it' : null} placeholder="https://" />
            <UrlField id="repo" label="Source code" value={form.repo_url} onChange={(v) => set('repo_url', v)} error={errors.repo_url}
              hint="Optional. Leave empty if the code is private." placeholder="https://github.com/…" />
          </section>

          <section id="media" className="scroll-mt-40 flex flex-col gap-4">
            <h2 className="text-[22px] font-bold">Screenshot &amp; video</h2>
            <div className="flex flex-wrap items-end gap-4">
              {form.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.thumbnail_url} alt="Current screenshot" className="aspect-[16/10] w-full min-w-0 max-w-[320px] flex-[0_1_320px] rounded-lg object-cover" />
              ) : (
                <span className="flex aspect-[16/10] w-full max-w-[320px] flex-[0_1_320px] items-center justify-center rounded-lg border border-dashed border-control text-sm text-text-tertiary">
                  No screenshot yet
                </span>
              )}
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={btnSecondary}>
                  {uploading ? 'Uploading…' : form.thumbnail_url ? 'Replace screenshot' : 'Upload screenshot'}
                </button>
                <span className="text-[13px] text-text-tertiary">16:9 or 16:10 reads best. Resized on upload.</span>
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => onScreenshot(e.target.files?.[0])} />
              </div>
            </div>
            <UrlField id="video" label="Walkthrough video" value={form.video_url} onChange={(v) => set('video_url', v)} error={errors.video_url}
              placeholder="https://youtube.com/watch?v=…"
              hint={form.video_url && !errors.video_url ? (videoOk ? '✓ YouTube video found' : 'Not a YouTube link — it will show as a plain link.') : 'Optional. A YouTube link gets a player on the page.'}
              hintTone={form.video_url && videoOk ? 'text-[#6FD39F]' : undefined} />
          </section>

          <section id="writeup" className="scroll-mt-40">
            <h2 className="mb-1.5 text-[22px] font-bold">Write-up</h2>
            <p className="mb-3.5 text-sm text-text-tertiary">The body of the product page. What problem it solves, how it works, who it’s for, what you’d do next.</p>
            <div className="rounded-lg border border-control bg-paper px-5 py-4 focus-within:border-link">
              <RichText value={form.details} onChange={(v) => set('details', v)} label="Write-up" placeholder="Start writing — headings you add become sections on the page." />
            </div>
          </section>

          <section id="team" className="scroll-mt-40">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[22px] font-bold">Team</h2>
              <span role="status" className={cn('font-mono text-sm', errors.team ? 'text-[#FF9C85]' : 'text-[#6FD39F]')}>
                {errors.team ? `Others: ${othersTotal}%` : 'Total 100% ✓'}
              </span>
            </div>
            <p className="mb-3.5 text-sm text-text-tertiary">
              {canManageTeam
                ? 'Credit everyone who worked on it. Your share is whatever is left, so the total is always 100%.'
                : 'Only the person who added this product can change the credits.'}
            </p>
            <ul className="mb-3 flex flex-col gap-2">
              {createdBy && (
                <TeamRow member={byId.get(createdBy)} role="Creator" share={Math.max(0, creatorShare)} fixed />
              )}
              {form.credits.map((c, i) => (
                <TeamRow
                  key={c.user_id}
                  member={byId.get(c.user_id)}
                  role={c.role_in_project}
                  share={c.contribution_percentage}
                  readOnly={!canManageTeam}
                  onRole={(v) => set('credits', form.credits.map((x, j) => (j === i ? { ...x, role_in_project: v } : x)))}
                  onShare={(v) => set('credits', form.credits.map((x, j) => (j === i ? { ...x, contribution_percentage: v } : x)))}
                  onRemove={() => set('credits', form.credits.filter((_, j) => j !== i))}
                />
              ))}
            </ul>
            {errors.team && <p role="alert" className="mb-3 text-sm text-[#FF9C85]">{errors.team}</p>}
            {canManageTeam && (
              <MemberPicker
                members={available}
                onPick={(m) => set('credits', [...form.credits, { user_id: m.id, role_in_project: 'Contributor', contribution_percentage: 10 }])}
              />
            )}
          </section>

          {productId && (isCreator || isAdmin) && (
            <section className="border-t border-rule pt-7">
              <h2 className="mb-1.5 text-[17px] font-bold">Delete this product</h2>
              <p className="mb-3.5 text-sm text-text-tertiary">Removes the page and its credits from every member’s profile. This can’t be undone.</p>
              <button type="button" onClick={remove} className="inline-flex min-h-[40px] items-center rounded-md border border-[#6B2A2A] px-3.5 text-sm font-semibold text-[#FF9C85] hover:border-[#FF9C85]">
                Delete product…
              </button>
            </section>
          )}
        </form>
      </div>
    </EditorFrame>
  )
}

/** Focused editor chrome: leave, title, save status, actions. */
export function EditorFrame({
  title,
  status,
  actions,
  back = { href: '/dashboard/products', label: 'Products' },
  children,
}: {
  title: string
  status: { text: string; tone: string } | null
  actions?: React.ReactNode
  back?: { href: string; label: string }
  children: React.ReactNode
}) {
  return (
    <>
      <div className="sticky top-[69px] z-30 border-b border-white/[0.08] bg-ink/[0.92] backdrop-blur-md">
        <div className={cn(CONTAINER_CLASS, 'flex min-h-[64px] flex-wrap items-center gap-x-5 gap-y-2.5 py-2')}>
          <Link href={back.href} className="text-[15px] font-medium text-text-secondary hover:text-text-primary">
            ← {back.label}
          </Link>
          <span className="hidden min-w-0 flex-auto truncate font-bold sm:block">{title}</span>
          <span className="flex-auto sm:hidden" />
          {status && <span className={cn('text-[13px] sm:text-sm', status.tone)}>{status.text}</span>}
          {actions}
        </div>
      </div>
      <div className={cn(CONTAINER_CLASS, 'pb-32 pt-10')}>{children}</div>
    </>
  )
}

function UrlField({
  id, label, value, onChange, error, missing, hint, hintTone, placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error: string | null
  missing?: string | null
  hint?: string
  hintTone?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {missing && <span className="font-normal text-signal"> · {missing}</span>}
      </label>
      <input
        id={id}
        type="url"
        inputMode="url"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.trim())}
        aria-invalid={!!error}
        className={cn(fieldClass, 'min-h-[46px]', error ? 'border-[#B5473A]' : missing ? 'border-[#5C4A26]' : '')}
      />
      {(error || hint) && <p className={cn(hintClass, error ? 'text-[#FF9C85]' : hintTone)}>{error || hint}</p>}
    </div>
  )
}

function TeamRow({
  member, role, share, fixed, readOnly, onRole, onShare, onRemove,
}: {
  member?: Member
  role: string
  share: number
  fixed?: boolean
  readOnly?: boolean
  onRole?: (v: string) => void
  onShare?: (v: number) => void
  onRemove?: () => void
}) {
  const name = member?.full_name || member?.username || 'Member'
  const locked = fixed || readOnly
  return (
    // Phones: name row, then role + share row. sm+: one grid row.
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-paper px-3 py-2.5 sm:grid sm:grid-cols-[40px_minmax(0,1fr)_150px_96px_32px]">
      <MemberAvatar name={name} src={member?.avatar_url} className="order-1 h-10 w-10 shrink-0 rounded-full text-sm" />
      <span className="order-2 min-w-0 flex-1 truncate font-semibold">{name}</span>
      {locked ? (
        <span className="order-4 min-w-0 flex-1 text-sm text-text-tertiary sm:order-3">{role}</span>
      ) : (
        <input
          value={role}
          onChange={(e) => onRole?.(e.target.value)}
          aria-label={`Role of ${name}`}
          className="order-4 min-h-[38px] min-w-0 flex-1 rounded-md border border-control bg-ink px-2.5 text-sm text-text-primary focus:border-link focus:outline-none sm:order-3"
        />
      )}
      {locked ? (
        <span className="order-5 w-[96px] text-right font-mono text-sm text-text-secondary sm:order-4 sm:w-auto">{share}%</span>
      ) : (
        <span className="order-5 flex w-[96px] items-center rounded-md border border-control bg-ink focus-within:border-link sm:order-4 sm:w-auto">
          <input
            value={share || ''}
            onChange={(e) => onShare?.(Math.min(100, parseInt(e.target.value.replace(/\D/g, '') || '0', 10)))}
            inputMode="numeric"
            aria-label={`Share of ${name}`}
            className="min-h-[38px] w-full min-w-0 bg-transparent pl-2.5 pr-1 text-right font-mono text-sm text-text-primary focus:outline-none"
          />
          <span className="pr-2.5 text-text-tertiary">%</span>
        </span>
      )}
      {!locked ? (
        <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="order-3 h-8 w-8 text-lg text-text-tertiary hover:text-text-primary sm:order-5">
          ×
        </button>
      ) : (
        <span className="order-3 hidden sm:order-5 sm:block" />
      )}
      {/* forces the role + share pair onto its own line on phones */}
      <span aria-hidden="true" className="order-3 basis-full sm:hidden" />
    </li>
  )
}

function MemberPicker({ members, onPick }: { members: Member[]; onPick: (m: Member) => void }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const matches = members.filter((m) => norm(`${m.full_name || ''} ${m.username}`).includes(norm(q))).slice(0, 8)

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-[40px] items-center rounded-md border border-dashed border-control px-3.5 text-sm font-semibold text-text-secondary hover:border-text-tertiary hover:text-text-primary">
        + Add a member
      </button>
    )
  }
  return (
    <div className="max-w-[420px] rounded-lg border border-control bg-paper p-2">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        placeholder="Search members by name"
        aria-label="Search members by name"
        className="mb-1 min-h-[40px] w-full rounded-md bg-ink px-3 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none"
      />
      <ul role="listbox" aria-label="Members" className="max-h-64 overflow-y-auto">
        {matches.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => {
                onPick(m)
                setOpen(false)
                setQ('')
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-white/[0.05]"
            >
              <MemberAvatar name={m.full_name} src={m.avatar_url} className="h-7 w-7 rounded-full text-[11px]" />
              <span className="truncate">{m.full_name || m.username}</span>
              <span className="ml-auto font-mono text-xs text-text-disabled">@{m.username}</span>
            </button>
          </li>
        ))}
        {matches.length === 0 && <li className="px-2 py-2 text-sm text-text-tertiary">No member matches “{q}”.</li>}
      </ul>
      <button type="button" onClick={() => setOpen(false)} className="mt-1 px-2 py-1 text-[13px] text-text-tertiary hover:text-text-primary">
        Cancel
      </button>
    </div>
  )
}
