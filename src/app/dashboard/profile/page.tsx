'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/components/Toast'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { MemberAvatar, btnPrimary, btnSecondary, fieldClass, hintClass, labelClass } from '@/components/dashboard/ui'
import { createClient } from '@/lib/supabase'
import { uploadImage } from '@/lib/upload'
import { cn } from '@/lib/utils'
import type { SocialLinks } from '@/types/database'

const LINKS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
  { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
]

const BIO_MAX = 160

function usernameProblem(v: string): string | null {
  if (!v) return 'Choose a username.'
  if (v.length < 3) return 'At least 3 characters.'
  if (v.length > 30) return 'At most 30 characters.'
  if (!/^[a-z0-9._-]+$/.test(v)) return 'Lowercase letters, numbers, dots, dashes and underscores only.'
  return null
}

function urlProblem(v?: string) {
  if (!v) return null
  try {
    const u = new URL(v)
    return u.protocol.startsWith('http') ? null : 'Start the link with https://'
  } catch {
    return 'Start the link with https://'
  }
}

interface Form {
  full_name: string
  username: string
  bio: string
  avatar_url: string | null
  social_links: SocialLinks
}

export default function ProfilePage() {
  const { profile, session, updateProfile } = useAuth()
  const { setPreview } = useDashboard()
  const { showToast } = useToast()

  const initial = useMemo<Form | null>(
    () =>
      profile && {
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || null,
        social_links: profile.social_links || {},
      },
    [profile]
  )
  const [form, setForm] = useState<Form | null>(initial)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [usernameTaken, setUsernameTaken] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm(initial)
  }, [initial])

  // Mirror edits into the navy band above, and clear on leave.
  useEffect(() => {
    if (form) setPreview({ full_name: form.full_name, bio: form.bio, avatar_url: form.avatar_url })
  }, [form, setPreview])
  useEffect(() => () => setPreview(null), [setPreview])

  // Username availability, checked after typing stops
  useEffect(() => {
    if (!form || !profile || form.username === profile.username || usernameProblem(form.username)) {
      setUsernameTaken(false)
      return
    }
    const t = setTimeout(async () => {
      const { data } = await (createClient() as any).from('profiles').select('id').eq('username', form.username).neq('id', profile.id).limit(1)
      setUsernameTaken(!!data?.length)
    }, 400)
    return () => clearTimeout(t)
  }, [form?.username, profile]) // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = !!form && !!initial && JSON.stringify(form) !== JSON.stringify(initial)

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  if (!form || !profile) {
    return <div aria-busy="true" className="h-[520px] animate-pulse rounded-[14px] bg-paper" />
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f))
  const uError = usernameProblem(form.username) || (usernameTaken ? 'Someone already uses this username.' : null)
  const linkErrors = Object.fromEntries(LINKS.map((l) => [l.key, urlProblem(form.social_links[l.key])]))
  const invalid = !form.full_name.trim() || !!uError || form.bio.length > BIO_MAX || Object.values(linkErrors).some(Boolean)

  const onPhoto = async (file?: File) => {
    if (!file || !session?.access_token) return
    try {
      setUploading(true)
      const img = await uploadImage(file, 'avatar', session.access_token)
      set('avatar_url', img.public_url)
    } catch (e: any) {
      showToast('error', e.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const save = async () => {
    if (invalid) return
    setSaving(true)
    const links = Object.fromEntries(Object.entries(form.social_links).filter(([, v]) => !!v)) as SocialLinks
    const result = await updateProfile({
      full_name: form.full_name.trim(),
      username: form.username,
      bio: form.bio.trim() || null,
      avatar_url: form.avatar_url,
      social_links: links,
    } as any)
    setSaving(false)
    if (result.error) showToast('error', result.error)
    else showToast('success', 'Profile saved')
  }

  const card = 'rounded-[14px] bg-paper px-7 py-[26px]'

  return (
    <>
      <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1.5">
        <h2 className="text-[28px] font-bold tracking-[-0.02em]">Profile</h2>
        <span className="text-text-tertiary">Changes show in the band above as you type. Everything here is public.</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="grid items-start gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr))]"
      >
        <div className={cn(card, 'flex flex-col gap-9')}>
          <fieldset>
            <legend className="mb-3.5 text-lg font-bold">Photo</legend>
            <div className="flex flex-wrap items-center gap-5">
              <MemberAvatar name={form.full_name} src={form.avatar_url} className="h-[88px] w-[88px] rounded-2xl text-[28px]" />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2.5">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={btnSecondary}>
                    {uploading ? 'Uploading…' : form.avatar_url ? 'Upload new' : 'Upload a photo'}
                  </button>
                  {form.avatar_url && (
                    <button type="button" onClick={() => set('avatar_url', null)} className="px-2.5 text-sm font-semibold text-text-tertiary hover:text-text-primary">
                      Remove
                    </button>
                  )}
                </div>
                <span className="text-[13px] text-text-tertiary">Square works best. Cropped and resized for you.</span>
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => onPhoto(e.target.files?.[0])} />
              </div>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-[18px]">
            <legend className="mb-3.5 text-lg font-bold">About you</legend>
            <div>
              <label htmlFor="name" className={labelClass}>Full name</label>
              <input id="name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className={cn(fieldClass, 'min-h-[46px]')} />
            </div>
            <div>
              <label htmlFor="user" className={labelClass}>Username</label>
              <div className={cn('flex items-center overflow-hidden rounded-md border bg-paper focus-within:border-link', uError ? 'border-[#B5473A]' : 'border-control')}>
                <span className="pl-3.5 pr-1 font-mono text-sm text-text-disabled">@</span>
                <input
                  id="user"
                  value={form.username}
                  onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                  aria-invalid={!!uError}
                  aria-describedby="user-hint"
                  className="min-h-[44px] min-w-0 flex-auto bg-transparent pr-3.5 font-mono text-sm text-text-primary focus:outline-none"
                />
              </div>
              <p id="user-hint" className={cn(hintClass, uError && 'text-[#FF9C85]')}>
                {uError || 'Lowercase letters, numbers, dots, dashes and underscores.'}
              </p>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between">
                <label htmlFor="bio" className="text-sm font-semibold">Bio</label>
                <span className={cn('font-mono text-[13px]', form.bio.length > BIO_MAX ? 'text-[#FF9C85]' : 'text-text-disabled')}>
                  {form.bio.length}/{BIO_MAX}
                </span>
              </div>
              <textarea id="bio" rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)} className={cn(fieldClass, 'resize-y py-3')} />
              <p className={hintClass}>One line about what you do, shown under your name. Your products, posts and results are added automatically.</p>
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-6">
          <fieldset className={cn(card, 'flex flex-col gap-3.5')}>
            <legend className="float-left mb-3.5 w-full text-lg font-bold">Links</legend>
            {LINKS.map((l) => (
              <div key={l.key}>
                <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
                  <label htmlFor={`l-${l.key}`} className="text-sm font-semibold">{l.label}</label>
                  <input
                    id={`l-${l.key}`}
                    type="url"
                    inputMode="url"
                    placeholder={l.placeholder}
                    value={form.social_links[l.key] || ''}
                    onChange={(e) => set('social_links', { ...form.social_links, [l.key]: e.target.value.trim() || undefined })}
                    aria-invalid={!!linkErrors[l.key]}
                    className={cn(fieldClass, 'min-h-[44px] text-sm', linkErrors[l.key] && 'border-[#B5473A]')}
                  />
                </div>
                {linkErrors[l.key] && <p className="ml-[108px] mt-1 text-[13px] text-[#FF9C85]">{linkErrors[l.key]}</p>}
              </div>
            ))}
          </fieldset>

          <PasswordCard className={card} email={session?.user?.email} />
        </div>
      </form>

      {dirty && (
        <div role="region" aria-label="Unsaved changes" className="sticky bottom-0 z-30 -mx-[clamp(20px,4vw,48px)] mt-8 border-t border-[#2A2E37] bg-paper/95 backdrop-blur">
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3 px-[clamp(20px,4vw,48px)] py-3.5">
            <span className="flex-auto text-sm text-text-secondary">{invalid ? 'Fix the highlighted fields to save.' : 'You have unsaved changes.'}</span>
            <button type="button" onClick={() => setForm(initial)} className={btnSecondary}>
              Discard
            </button>
            <button type="button" onClick={save} disabled={saving || invalid} className={btnPrimary}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function PasswordCard({ className, email }: { className: string; email?: string }) {
  const { changePassword } = useAuth()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    if (next.length < 8) return setError('Use at least 8 characters.')
    setBusy(true)
    const r = await changePassword(current, next)
    setBusy(false)
    if (r.error) return setError(r.error)
    setCurrent('')
    setNext('')
    setOpen(false)
    showToast('success', 'Password updated')
  }

  return (
    <section aria-labelledby="signin" className={cn(className, 'flex flex-col gap-3.5')}>
      <h3 id="signin" className="text-lg font-bold">Sign-in</h3>
      <div className="flex flex-wrap justify-between gap-2 text-[15px]">
        <span className="min-w-0 break-all">
          <span className="text-text-tertiary">Email </span>
          {email}
        </span>
        <span className="text-[13px] text-text-disabled">Ask an admin to change it</span>
      </div>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={cn(btnSecondary, 'self-start')}>
        Change password
      </button>
      {open && (
        <div className="flex flex-col gap-2.5 rounded-[10px] bg-ink p-[18px]">
          <input type="password" autoComplete="current-password" placeholder="Current password" aria-label="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} className={cn(fieldClass, 'min-h-[44px] bg-ink')} />
          <input type="password" autoComplete="new-password" placeholder="New password · 8+ characters" aria-label="New password" value={next} onChange={(e) => setNext(e.target.value)} className={cn(fieldClass, 'min-h-[44px] bg-ink')} />
          {error && <p role="alert" className="text-[13px] text-[#FF9C85]">{error}</p>}
          <button type="button" onClick={submit} disabled={busy || !current || !next} className={cn(btnPrimary, 'self-start')}>
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </div>
      )}
    </section>
  )
}
