'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Container } from '@/components/editorial'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const code = `${error.digest ? `Error ${error.digest}` : 'Error'} · ${pathname}`

  return (
    <Container className="pb-28 pt-20">
      <div className="max-w-[640px]">
        <p className="mb-3.5 flex items-center gap-2.5 text-[15px] font-semibold text-[#FFB4A3]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M12 8v5M12 16.5v.5" />
            <circle cx="12" cy="12" r="9.5" />
          </svg>
          Something went wrong
        </p>
        <h1 className="mb-3.5 text-[clamp(32px,3.6vw,46px)] font-bold leading-[1.08] tracking-[-0.03em]">This page didn’t load. It’s on our side, not yours.</h1>
        <p className="mb-7 text-lg text-text-secondary">Trying again usually fixes it. Anything you were typing in an editor was saved up to the last “Saved” message.</p>
        <div className="mb-9 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => {
              setRetrying(true)
              reset()
              setTimeout(() => setRetrying(false), 1500)
            }}
            className="min-h-[48px] rounded-md bg-text-primary px-[22px] font-semibold text-ink hover:bg-white"
          >
            {retrying ? 'Trying again…' : 'Try again'}
          </button>
          <Link href="/" className="inline-flex min-h-[48px] items-center rounded-md border border-control px-5 font-semibold text-text-primary hover:border-text-tertiary">
            Go to the homepage
          </Link>
        </div>
        <details className="border-t border-rule pt-[18px]">
          <summary className="cursor-pointer text-[15px] font-semibold text-text-secondary">If it keeps happening</summary>
          <p className="mb-2.5 mt-3 text-[15px] text-text-tertiary">Send us this code with the page you were on — it lets us find the exact error.</p>
          <div className="flex items-center gap-2">
            <code className="flex min-h-[40px] min-w-0 flex-auto items-center break-all rounded-md bg-paper px-3 font-mono text-sm text-text-primary">{code}</code>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code)
                  setCopied(true)
                } catch {}
              }}
              className="min-h-[40px] shrink-0 rounded-md border border-control px-3.5 text-sm font-semibold text-text-primary hover:border-text-tertiary"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <Link href="/contact?topic=bug" className="mt-3 inline-block text-[15px] font-semibold text-link hover:text-text-primary">Report it →</Link>
        </details>
      </div>
    </Container>
  )
}
