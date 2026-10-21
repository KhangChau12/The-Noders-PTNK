'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { btnPrimary, btnSecondary } from '@/components/dashboard/ui'
import { DashCertificate, describeCertificate, formatDay } from '@/lib/dashboard'
import { linkedInAddUrl, verifyUrl } from '@/lib/certificates'
import { SOCIAL_LINKS } from '@/lib/constants'

export default function CertificatesPage() {
  const { data, ready } = useDashboard()

  return (
    <>
      <div className="mb-7">
        <h2 className="mb-1.5 text-[28px] font-bold tracking-[-0.02em]">Certificates</h2>
        <p className="max-w-[620px] text-text-tertiary">Issued by The Noders. Each one has a public page that anyone can check with its code.</p>
      </div>

      {!ready ? (
        <div aria-busy="true" className="h-[320px] max-w-[1080px] animate-pulse rounded-[14px] bg-paper" />
      ) : data.certificates.length ? (
        <ul className="flex max-w-[1080px] flex-col gap-6">
          {data.certificates.map((c) => (
            <li key={c.id}>
              <CertificateCard cert={c} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="max-w-[560px] rounded-[14px] bg-paper p-7">
          <h3 className="mb-1.5 text-xl font-bold">No certificates yet</h3>
          <p className="text-text-secondary">
            Certificates are issued for contest results and for taking part in the community’s programmes. When you receive one, it appears here
            with a link you can share.
          </p>
          <Link href="/contest" className="mt-4 inline-block text-sm font-semibold text-link hover:text-text-primary">
            See past and upcoming contests →
          </Link>
        </div>
      )}

      <section className="mt-10 max-w-[640px] border-t border-rule pt-6">
        <h3 className="mb-1.5 text-[17px] font-bold">Something wrong?</h3>
        <p className="text-[15px] text-text-tertiary">
          A misspelled name or a missing certificate is fixed by the team —{' '}
          <a href={`mailto:${SOCIAL_LINKS.email}?subject=Certificate%20correction`} className="text-link hover:text-text-primary">
            send a correction
          </a>{' '}
          and include the code.
        </p>
      </section>
    </>
  )
}

function CertificateCard({ cert }: { cert: DashCertificate }) {
  const d = describeCertificate(cert)
  const link = verifyUrl(cert.certificate_id)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the field is selectable */
    }
  }

  return (
    <article className="flex flex-wrap overflow-hidden rounded-[14px] bg-paper">
      <Link href={`/verify/${cert.certificate_id}`} className="block min-w-0 flex-[1_1_340px] bg-ink">
        {cert.file_type === 'image' && cert.file_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cert.file_url} alt={`${d.award} certificate, ${d.program}`} className="block aspect-[2000/1414] w-full object-cover" />
        ) : (
          <span className="flex aspect-[2000/1414] w-full flex-col items-center justify-center gap-1 text-text-tertiary">
            <span className="font-mono text-sm">PDF</span>
            <span className="text-[13px]">Open the public page to view it</span>
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-4 px-7 py-6">
        <div>
          <p className="mb-1 text-sm font-semibold" style={{ color: d.tone }}>{d.award}</p>
          <h3 className="text-[22px] font-bold leading-tight">
            {d.href ? <Link href={d.href} className="hover:text-link">{d.program}</Link> : d.program}
          </h3>
          <p className="mt-1.5 text-sm text-text-tertiary">
            Issued {formatDay(cert.issued_at)} · <span className="font-mono">{cert.certificate_id}</span>
          </p>
        </div>

        <div>
          <label htmlFor={`link-${cert.id}`} className="mb-1.5 block text-[13px] text-text-tertiary">Verification link</label>
          <div className="flex gap-1.5">
            <input
              id={`link-${cert.id}`}
              readOnly
              value={link.replace(/^https?:\/\//, '')}
              onFocus={(e) => e.currentTarget.select()}
              className="min-h-[40px] min-w-0 flex-auto rounded-md border border-control bg-ink px-3 font-mono text-[13px] text-text-primary focus:outline-none"
            />
            <button type="button" onClick={copy} className={btnSecondary} aria-live="polite">
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={linkedInAddUrl(cert)} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
            Add to LinkedIn
          </a>
          {cert.file_url && (
            <a href={cert.file_url} target="_blank" rel="noopener noreferrer" download className={btnSecondary}>
              Download {cert.file_type === 'pdf' ? 'PDF' : 'image'}
            </a>
          )}
          <Link href={`/verify/${cert.certificate_id}`} className="px-2.5 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary">
            Public page ↗
          </Link>
        </div>
        <p className="text-[13px] text-text-tertiary">LinkedIn opens with the name, issuer, date and link filled in — you just confirm.</p>
      </div>
    </article>
  )
}
