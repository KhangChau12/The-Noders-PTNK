'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { SOCIAL_LINKS } from '@/lib/constants'
import { validateEmail } from '@/lib/utils'
import { cn } from '@/lib/utils'

/** Only same-site paths are allowed as a return target. */
export function safeNext(raw: string | null) {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard'
}

function friendly(message: string) {
  if (/invalid login credentials/i.test(message)) return 'That email and password don’t match. Passwords are case-sensitive.'
  if (/email not confirmed/i.test(message)) return 'This account isn’t activated yet. Ask the core team to confirm it.'
  if (/rate|too many/i.test(message)) return 'Too many attempts. Wait a minute and try again.'
  return message
}

const field =
  'w-full min-h-[48px] rounded-lg border border-control bg-paper px-3.5 text-base text-text-primary placeholder:text-text-disabled focus:border-link focus:outline-none disabled:opacity-60'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const params = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Enter your email and password.')
    if (!validateEmail(email)) return setError('That doesn’t look like an email address.')
    setLoading(true)
    try {
      const result = await signIn(email.trim(), password)
      if (result.error) setError(friendly(result.error))
      else router.push(safeNext(params.get('next')))
    } catch {
      setError('Something went wrong. Try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <h1 className="mb-2 text-center text-[32px] font-bold leading-tight tracking-[-0.025em]">Sign in</h1>
      <p className="mb-9 text-center text-text-tertiary">For members of The Noders.</p>

      {error && (
        <div role="alert" className="mb-[18px] rounded-lg border border-[#6B2A2A] bg-[#2A1714] px-3.5 py-3 text-sm text-[#FFC9B8]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className={field}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="password" className="text-sm font-semibold">Password</label>
            <button type="button" onClick={() => setForgot(!forgot)} aria-expanded={forgot} className="text-sm font-semibold text-link hover:text-text-primary">
              Forgot it?
            </button>
          </div>
          <div className="flex items-center rounded-lg border border-control bg-paper focus-within:border-link">
            <input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="min-h-[46px] min-w-0 flex-auto rounded-lg bg-transparent px-3.5 text-base text-text-primary focus:outline-none"
            />
            <button type="button" onClick={() => setShow(!show)} aria-pressed={show} className="min-h-[46px] px-3.5 text-sm font-semibold text-text-tertiary hover:text-text-primary">
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          {forgot && (
            <p className="mt-2.5 rounded-lg bg-paper px-3.5 py-3 text-sm text-text-secondary">
              The core team resets passwords — message us on{' '}
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-link hover:text-text-primary">Facebook</a> or{' '}
              <Link href="/contact" className="text-link hover:text-text-primary">here</Link>, and change the new one from your dashboard.
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={cn('mt-1.5 min-h-[50px] rounded-lg font-semibold text-ink transition-colors', loading ? 'bg-text-secondary' : 'bg-text-primary hover:bg-white')}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 text-center text-[15px] text-text-tertiary">
        Not a member?{' '}
        <Link href="/contact?topic=join" className="font-semibold text-link hover:text-text-primary">Ask to join</Link>
      </p>
    </div>
  )
}
