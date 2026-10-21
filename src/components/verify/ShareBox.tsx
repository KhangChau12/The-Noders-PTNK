'use client'

import { useState } from 'react'
import { linkedInAddUrl, verifyUrl } from '@/lib/certificates'

/** Sharing actions for a verified certificate. LinkedIn only for the owner's use, but harmless for anyone. */
export function ShareBox({ cert }: { cert: { certificate_id: string; title: string; issued_at: string } }) {
  const [copied, setCopied] = useState(false)
  const url = verifyUrl(cert.certificate_id)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  const ghost = 'flex min-h-[46px] items-center justify-center rounded-md border border-control font-semibold text-text-primary transition-colors hover:border-text-tertiary'

  return (
    <div className="rounded-xl bg-paper p-6">
      <h2 className="mb-1 text-[17px] font-bold">Share this certificate</h2>
      <p className="mb-4 text-sm text-text-tertiary">Anyone with the link sees this page, so they can check it themselves.</p>
      <div className="flex flex-col gap-2.5">
        <a
          href={linkedInAddUrl(cert)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[48px] items-center justify-center rounded-md bg-text-primary font-semibold text-ink transition-colors hover:bg-white"
        >
          Add to LinkedIn profile ↗
        </a>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={copy} aria-live="polite" className={ghost}>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={ghost}>
            Facebook ↗
          </a>
        </div>
      </div>
    </div>
  )
}
