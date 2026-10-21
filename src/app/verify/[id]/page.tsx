import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb, Container } from '@/components/editorial'
import { ShareBox } from '@/components/verify/ShareBox'
import { MemberAvatarServer } from '@/components/verify/MemberAvatarServer'
import { normalizeCode, verifyUrl } from '@/lib/certificates'
import { SOCIAL_LINKS } from '@/lib/constants'
import { describeCertificate, formatDay } from '@/lib/dashboard'
import { CONTESTS, contestResultsFor, MemberContestResult } from '@/lib/programs'
import { ordinal } from '@/lib/memberSummary'
import { getCertificate } from '@/lib/verify'

export const revalidate = 300

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const code = normalizeCode(decodeURIComponent(id))
  const cert = code ? await getCertificate(code) : null
  if (!cert) {
    return { title: 'Certificate not found', robots: { index: false } }
  }
  const d = describeCertificate(cert)
  const who = cert.member?.full_name || 'a member'
  const title = `${d.award === "Participation" ? "Certificate of Participation" : d.award} — ${d.program} · ${cert.certificate_id}`
  const description = `Verified: issued by The Noders to ${who} on ${formatDay(cert.issued_at)}.`
  const image = cert.file_type === 'image' && cert.file_url ? [{ url: cert.file_url, width: 2000, height: 1414, alt: `${d.award} certificate awarded to ${who}` }] : undefined
  return {
    title,
    description,
    alternates: { canonical: verifyUrl(cert.certificate_id) },
    openGraph: { title, description, url: verifyUrl(cert.certificate_id), type: 'website', images: image },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, images: image?.map((i) => i.url) },
  }
}

export default async function VerifyResultPage({ params }: Params) {
  const { id } = await params
  const raw = decodeURIComponent(id)
  const code = normalizeCode(raw)
  const cert = code ? await getCertificate(code) : null

  if (!cert) return <NotFound code={code || raw.toUpperCase()} />

  const d = describeCertificate(cert)
  const name = cert.member?.full_name || cert.member?.username || 'Unknown member'
  const contest = d.href ? CONTESTS.find((c) => `/contest/${c.slug}` === d.href) : undefined
  const result: MemberContestResult | undefined = contest ? contestResultsFor(cert.member?.full_name).find((r) => r.contest.slug === contest.slug) : undefined

  return (
    <>
      <section className="bg-navy text-white">
        <Container className="pb-12 pt-10">
          <div className="mb-7">
            <Breadcrumb items={[{ label: 'Verify', href: '/verify' }, { label: cert.certificate_id }]} />
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
            <span aria-hidden="true" className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#3FB57A]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0D2A1B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            </span>
            <div className="min-w-0 flex-[1_1_520px]">
              <p className="mb-1 text-[15px] font-semibold text-[#B9F0D2]">Verified · issued by The Noders</p>
              <h1 className="text-[clamp(28px,3.2vw,42px)] font-bold leading-[1.1] tracking-[-0.03em]">
                {d.award === 'Participation' ? `Certificate of Participation — ${d.program}` : `${d.award} — ${d.program}`}
              </h1>
              <p className="mt-2 text-lg text-on-navy">
                Awarded to{' '}
                {cert.member ? (
                  <Link href={`/members/${cert.member.id}`} className="font-semibold text-white underline underline-offset-[3px] hover:text-on-navy">
                    {name}
                  </Link>
                ) : (
                  <span className="font-semibold text-white">{name}</span>
                )}{' '}
                on {formatDay(cert.issued_at)}.
              </p>
            </div>
            <span className="rounded-lg border border-white/35 px-4 py-2.5 font-mono text-[22px] tracking-[0.06em]">{cert.certificate_id}</span>
          </div>
        </Container>
      </section>

      <Container className="flex flex-wrap items-start gap-x-14 gap-y-10 pt-12">
        <figure className="min-w-0 flex-[1_1_640px]">
          {cert.file_type === 'image' && cert.file_url ? (
            <a href={cert.file_url} target="_blank" rel="noopener noreferrer" title="Open full size" className="block overflow-hidden rounded-[10px] bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cert.file_url} alt={`${d.award} certificate awarded to ${name}, ${d.program}`} className="block aspect-[2000/1414] w-full object-cover" />
            </a>
          ) : cert.file_url ? (
            <object data={cert.file_url} type="application/pdf" aria-label={`Certificate PDF for ${name}`} className="block aspect-[2000/1414] w-full rounded-[10px] bg-paper">
              <a href={cert.file_url} className="flex aspect-[2000/1414] w-full items-center justify-center rounded-[10px] bg-paper font-semibold text-link">
                Open the PDF ↗
              </a>
            </object>
          ) : (
            <div className="flex aspect-[2000/1414] w-full items-center justify-center rounded-[10px] bg-paper text-text-tertiary">No file on record</div>
          )}
          <figcaption className="mt-3 flex flex-wrap justify-between gap-x-5 gap-y-2 text-sm text-text-tertiary">
            <span>The original file, exactly as issued · {cert.file_type === 'pdf' ? 'PDF' : 'Image'}</span>
            {cert.file_url && (
              <span className="flex gap-5 font-semibold">
                <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="text-link hover:text-text-primary">Open full size ↗</a>
                <a href={cert.file_url} download className="text-link hover:text-text-primary">Download</a>
              </span>
            )}
          </figcaption>
        </figure>

        <aside className="flex min-w-0 flex-[0_1_400px] flex-col gap-5">
          <dl className="flex flex-col gap-[18px] rounded-xl bg-paper p-6">
            <div>
              <dt className="mb-1.5 text-[13px] text-text-tertiary">Issued to</dt>
              <dd>
                {cert.member ? (
                  <Link href={`/members/${cert.member.id}`} className="group flex items-center gap-3 text-text-primary">
                    <MemberAvatarServer name={name} src={cert.member.avatar_url} />
                    <span>
                      <span className="block font-bold">{name}</span>
                      <span className="block text-sm text-link group-hover:text-text-primary">See their profile and work →</span>
                    </span>
                  </Link>
                ) : (
                  <span className="font-bold">{name}</span>
                )}
              </dd>
            </div>
            <div className="border-t border-[#2A2E37] pt-4">
              <dt className="mb-0.5 text-[13px] text-text-tertiary">For</dt>
              <dd>
                {result ? `${ordinal(result.rank)} of ${result.of} in ` : d.award === 'Participation' ? 'Taking part in ' : `${d.award} in `}
                {d.href ? <Link href={d.href} className="text-link hover:text-text-primary">{d.program}</Link> : d.program}
                {result && contest ? ` — ${contest.metric.split(",")[0]} ${result.score.toFixed(4)}` : ''}
                {cert.description && <span className="mt-1 block text-sm text-text-secondary">{cert.description}</span>}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-[#2A2E37] pt-4">
              <div>
                <dt className="mb-0.5 text-[13px] text-text-tertiary">Issued</dt>
                <dd>{formatDay(cert.issued_at)}</dd>
              </div>
              <div>
                <dt className="mb-0.5 text-[13px] text-text-tertiary">Code</dt>
                <dd className="font-mono">{cert.certificate_id}</dd>
              </div>
            </div>
            <div className="border-t border-[#2A2E37] pt-4">
              <dt className="mb-0.5 text-[13px] text-text-tertiary">Title on record</dt>
              <dd className="text-[15px] text-text-secondary">{cert.title}</dd>
            </div>
          </dl>
          <ShareBox cert={cert} />
        </aside>
      </Container>

      <Container className="pb-28 pt-[72px]">
        <p className="max-w-[760px] text-[15px] text-text-tertiary">
          This page is the official record. If the copy you were given differs from the file above — a different name, award or date — it was
          not issued by The Noders.{' '}
          <a href={`mailto:${SOCIAL_LINKS.email}?subject=Certificate%20${cert.certificate_id}`} className="text-link hover:text-text-primary">
            Report a problem
          </a>{' '}
          ·{' '}
          <Link href="/verify" className="text-link hover:text-text-primary">
            Check another code
          </Link>
        </p>
      </Container>
    </>
  )
}

function NotFound({ code }: { code: string }) {
  return (
    <Container className="pb-40 pt-[72px]">
      <div className="max-w-[640px]">
        <p className="mb-3 flex items-center gap-2.5 text-[15px] font-semibold text-[#FFB4A3]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M12 8v5M12 16.5v.5" />
            <circle cx="12" cy="12" r="9.5" />
          </svg>
          Not found
        </p>
        <h1 className="mb-3.5 text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.1] tracking-[-0.03em]">
          No certificate has the code <span className="font-mono">{code.slice(0, 24)}</span>.
        </h1>
        <p className="mb-7 text-[17px] text-text-secondary">
          Check the code against the top-left corner of the certificate — a letter C and four digits. If it matches and still isn’t found, the
          certificate was not issued by The Noders.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/verify" className="inline-flex min-h-[48px] items-center rounded-md bg-text-primary px-5 font-semibold text-ink hover:bg-white">
            Try another code
          </Link>
          <a href={`mailto:${SOCIAL_LINKS.email}`} className="inline-flex min-h-[48px] items-center rounded-md border border-control px-5 font-semibold text-text-primary hover:border-text-tertiary">
            Contact us
          </a>
        </div>
      </div>
    </Container>
  )
}
