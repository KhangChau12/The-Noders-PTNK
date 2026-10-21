import type { Metadata } from 'next'
import { Container } from '@/components/editorial'
import { VerifyForm } from '@/components/verify/VerifyForm'
import { SOCIAL_LINKS, SITE_CONFIG } from '@/lib/constants'
import { formatMonth } from '@/lib/dashboard'
import { getCertificateStats } from '@/lib/verify'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Verify a certificate',
  description: 'Check that a certificate issued by The Noders is real: enter the code printed on it to see who it was issued to, for what, and the original file.',
  alternates: { canonical: `${SITE_CONFIG.url}/verify` },
}

const TELLS = [
  { title: 'Who it belongs to', body: 'The member’s name, linked to their public profile and the work behind the award.' },
  { title: 'What it’s for, and when', body: 'The award, the programme it came from and the date it was issued.' },
  { title: 'The original file', body: 'The exact certificate we issued, so you can compare it with the copy you were given.' },
]

export default async function VerifyPage() {
  const stats = await getCertificateStats()

  return (
    <>
      <section className="bg-navy text-white">
        <Container className="pb-20 pt-[72px]">
          <div className="max-w-[720px]">
            <p className="mb-4 text-[15px] text-on-navy">Certificate verification</p>
            <h1 className="mb-4 text-[clamp(32px,3.8vw,50px)] font-bold leading-[1.06] tracking-[-0.03em]">Check that a Noders certificate is real.</h1>
            <p className="mb-9 text-lg text-on-navy">
              Enter the code printed at the top of the certificate. You’ll see who it was issued to, for what, and the original file.
            </p>
            <VerifyForm />
          </div>
        </Container>
      </section>

      <Container className="flex flex-wrap items-center gap-x-[72px] gap-y-10 pt-[88px]">
        <div className="min-w-0 flex-[1_1_360px]">
          <h2 className="mb-3.5 text-[clamp(26px,2.6vw,34px)] font-bold leading-tight tracking-[-0.02em]">Where to find the code</h2>
          <p className="mb-4 text-[17px] text-text-secondary">
            Every certificate carries a line in its top-left corner:{' '}
            <span className="font-mono text-text-primary">Verify at: thenodersptnk.com/verify/C0003</span>. The code is the part after{' '}
            <span className="font-mono text-text-primary">/verify/</span> — a letter C followed by four digits.
          </p>
          <p className="text-[17px] text-text-secondary">Scanning or opening that link takes you straight to the result.</p>
        </div>
        {stats.sampleImage && (
          <figure className="relative min-w-0 flex-[1_1_560px] overflow-hidden rounded-[10px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stats.sampleImage} alt="A Noders certificate with the verification line in its top-left corner" className="block aspect-[2000/1414] w-full object-cover" />
            <span
              aria-hidden="true"
              className="absolute left-[0.8%] top-[1.2%] h-[4.6%] w-[37%] rounded-md border-[3px] border-signal shadow-[0_0_0_9999px_rgba(13,15,20,0.45)]"
            />
          </figure>
        )}
      </Container>

      <Container className="pb-28 pt-24">
        <h2 className="mb-7 text-[clamp(26px,2.6vw,34px)] font-bold leading-tight tracking-[-0.02em]">What a verified result tells you</h2>
        <div className="grid gap-x-10 gap-y-8 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {TELLS.map((t) => (
            <div key={t.title} className="border-t-2 border-link pt-[18px]">
              <h3 className="mb-1.5 text-[19px] font-bold">{t.title}</h3>
              <p className="text-[15px] text-text-secondary">{t.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-[15px] text-text-tertiary">
          {stats.count > 0 && `${stats.count} certificates issued${stats.since ? ` since ${formatMonth(stats.since)}` : ''}. `}
          Questions about a certificate?{' '}
          <a href={`mailto:${SOCIAL_LINKS.email}`} className="font-semibold text-link hover:text-text-primary">
            Contact us
          </a>
          .
        </p>
      </Container>
    </>
  )
}
