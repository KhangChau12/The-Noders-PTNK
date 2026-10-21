'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { PageHero } from '@/components/PageHero'
import { Container } from '@/components/editorial'
import { SITE_CONFIG, SOCIAL_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const TOPICS = [
  { value: 'general', label: 'General', hint: 'Questions, passwords', prompt: 'What would you like to know?' },
  { value: 'join', label: 'Join the club', hint: 'For PTNK students', prompt: 'Your class, and what you’d like to work on — products, writing, contests or teaching' },
  { value: 'collaboration', label: 'Work together', hint: 'Schools, clubs, sponsors', prompt: 'Who you are and what you have in mind' },
  { value: 'bug', label: 'Report a bug', hint: 'Something broken here', prompt: 'Which page, what you clicked, what happened' },
] as const
type Topic = (typeof TOPICS)[number]['value']

const MAX = 2000
const field = 'w-full rounded-md border border-control bg-paper px-3.5 text-[15px] text-text-primary placeholder:text-text-disabled focus:border-link focus:outline-none'

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Write to the core team."
        description="Questions, joining, working together, or something broken on the site. Pick what it’s about so it reaches the right person."
        aside={
          <dl className="flex flex-col gap-3.5 text-[15px] text-white">
            <div>
              <dt className="text-[13px] text-on-navy">Email</dt>
              <dd><a href={`mailto:${SOCIAL_LINKS.email}`} className="font-semibold hover:text-on-navy">{SOCIAL_LINKS.email}</a></dd>
            </div>
            <div>
              <dt className="text-[13px] text-on-navy">Facebook</dt>
              <dd><a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-on-navy">facebook.com/thenodersptnk ↗</a></dd>
            </div>
          </dl>
        }
      />
      <Suspense>
        <ContactForm />
      </Suspense>
    </>
  )
}

function ContactForm() {
  const params = useSearchParams()
  const initial = TOPICS.find((t) => t.value === params.get('topic'))?.value || 'general'
  const [topic, setTopic] = useState<Topic>(initial)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)
  const current = TOPICS.find((t) => t.value === topic)!

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message.trim()) {
      setError('Fill in your name, a valid email and a message.')
      return
    }
    setError(null)
    setState('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'YOUR_WEB3FORMS_ACCESS_KEY',
          name,
          email,
          subject: `The Noders — ${current.label}`,
          message: `Topic: ${current.label}\nFrom: ${name} <${email}>\n\n${message}\n\n— Sent from ${SITE_CONFIG.url}/contact`,
        }),
      })
      const result = await res.json()
      if (!result.success) throw new Error()
      setState('sent')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setError('Couldn’t send — check your connection and try again, or email us directly.')
      setState('idle')
    }
  }

  return (
    <Container className="flex flex-wrap items-start gap-x-16 gap-y-10 pb-24 pt-12">
      {state === 'sent' ? (
        <div className="min-w-0 max-w-[720px] flex-[1_1_640px] rounded-xl bg-paper p-8">
          <p className="mb-1.5 font-semibold text-[#6FD39F]">✓ Sent</p>
          <h2 className="mb-2 text-2xl font-bold">Thanks — your message is with the core team.</h2>
          <p className="mb-5 text-text-secondary">The reply goes to the email you gave. If it’s urgent, message us on Facebook too.</p>
          <button type="button" onClick={() => setState('idle')} className="font-semibold text-link hover:text-text-primary">Send another →</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex min-w-0 max-w-[720px] flex-[1_1_640px] flex-col gap-[22px]">
          <fieldset>
            <legend className="mb-2.5 text-sm font-semibold">What’s it about?</legend>
            <div role="radiogroup" className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
              {TOPICS.map((t) => {
                const on = t.value === topic
                return (
                  <button
                    key={t.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setTopic(t.value)}
                    className={cn('min-h-[64px] rounded-lg border px-3.5 py-2.5 text-left transition-colors', on ? 'border-[#4A6BA8] bg-navy text-white' : 'border-control hover:border-text-tertiary')}
                  >
                    <span className="block text-[15px] font-semibold">{t.label}</span>
                    <span className={cn('block text-[13px]', on ? 'text-on-navy' : 'text-text-tertiary')}>{t.hint}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>
          {topic === 'join' && (
            <p className="-mt-2 rounded-lg bg-paper px-3.5 py-3 text-sm text-text-secondary">
              Tell us your class and what you’d like to work on. Accounts are made by the core team once you’re in.
            </p>
          )}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">Your name</label>
              <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={cn(field, 'min-h-[46px]')} />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email for the reply</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={cn(field, 'min-h-[46px]')} />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between">
              <label htmlFor="msg" className="text-sm font-semibold">Message</label>
              <span className={cn('font-mono text-[13px]', message.length > MAX ? 'text-[#FF9C85]' : 'text-text-disabled')}>{message.length}/{MAX}</span>
            </div>
            <textarea id="msg" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={current.prompt} className={cn(field, 'resize-y py-3')} />
          </div>
          {error && <p role="alert" className="rounded-lg border border-[#6B2A2A] bg-[#2A1714] px-3.5 py-3 text-sm text-[#FFC9B8]">{error}</p>}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={state === 'sending' || message.length > MAX}
              className="min-h-[48px] rounded-md bg-text-primary px-[22px] font-semibold text-ink hover:bg-white disabled:bg-text-secondary"
            >
              {state === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            <span className="text-sm text-text-tertiary">Goes to the core team’s inbox; the reply comes to your email.</span>
          </div>
        </form>
      )}

      <aside className="min-w-0 flex-[0_1_360px]">
        <h2 className="mb-2 text-[17px] font-bold">Before you write</h2>
        <ul className="flex flex-col gap-2.5 text-[15px] text-text-secondary">
          <li>Checking a certificate? <Link href="/verify" className="font-semibold text-link hover:text-text-primary">Verify it here</Link> — no need to ask.</li>
          <li>Forgot your password? Pick <b className="text-text-primary">General</b> and include your account email; we’ll reset it.</li>
          <li>Found a bug? Say which page and what you clicked.</li>
        </ul>
      </aside>
    </Container>
  )
}
