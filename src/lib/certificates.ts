import { SITE_CONFIG } from '@/lib/constants'
import { describeCertificate, type CertificateFacts } from '@/lib/dashboard'

export const verifyUrl = (code: string) => `${SITE_CONFIG.url.replace(/\/$/, '')}/verify/${code}`

/** LinkedIn's "Add licence or certification" form, pre-filled. */
export function linkedInAddUrl(cert: CertificateFacts & { certificate_id: string; issued_at: string }) {
  const d = describeCertificate(cert)
  const issued = new Date(cert.issued_at)
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: d.award === 'Participation' ? `Participation — ${d.program}` : `${d.award} — ${d.program}`,
    organizationName: 'The Noders PTNK',
    issueYear: String(issued.getFullYear()),
    issueMonth: String(issued.getMonth() + 1),
    certUrl: verifyUrl(cert.certificate_id),
    certId: cert.certificate_id,
  })
  return `https://www.linkedin.com/profile/add?${params.toString()}`
}

/** Accept "c3", "0003", "C0003" or a pasted link; return C + 4 digits, or null. */
export function normalizeCode(raw: string): string | null {
  const s = raw.trim()
  const fromLink = s.match(/verify\/([A-Za-z]?\d{1,4})/)
  const body = (fromLink ? fromLink[1] : s).replace(/^[cC]/, '')
  return /^\d{1,4}$/.test(body) ? `C${body.padStart(4, '0')}` : null
}
