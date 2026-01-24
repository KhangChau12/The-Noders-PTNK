'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { Avatar } from '@/components/Avatar'
import {
  ArrowLeft,
  ShieldCheck,
  ShieldX,
  Calendar,
  ExternalLink,
  Github,
  Facebook,
  Linkedin,
  Globe,
  Download,
  Share2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import type { CertificateVerifyResult, SocialLinks } from '@/types/database'

const locale = {
  en: {
    loading: 'Verifying certificate...',
    valid: 'Certificate Verified',
    validDesc: 'This is an authentic certificate issued by The Noders PTNK',
    invalid: 'Certificate Not Found',
    invalidDesc: 'We could not find a certificate with this ID. Please check the ID and try again.',
    backToVerify: 'Back to Verification',
    issuedOn: 'Issued On',
    generation: 'Generation',
    issuedBy: 'Issued By',
    viewProfile: 'View Profile',
    downloadCert: 'Download',
    shareCert: 'Share',
    verifiedBadge: 'Verified Member'
  },
  vi: {
    loading: 'Đang xác thực chứng chỉ...',
    valid: 'Chứng chỉ hợp lệ',
    validDesc: 'Đây là chứng chỉ chính thức được cấp bởi The Noders PTNK',
    invalid: 'Không tìm thấy chứng chỉ',
    invalidDesc: 'Chúng tôi không tìm thấy chứng chỉ với mã này. Vui lòng kiểm tra lại mã và thử lại.',
    backToVerify: 'Quay lại',
    issuedOn: 'Ngày cấp',
    generation: 'Thế hệ',
    issuedBy: 'Người cấp',
    viewProfile: 'Xem hồ sơ',
    downloadCert: 'Tải xuống',
    shareCert: 'Chia sẻ',
    verifiedBadge: 'Đã xác thực'
  }
}

export default function VerifyResultPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const t = locale[language as keyof typeof locale] || locale.en

  const certificateId = params.id as string

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<CertificateVerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/certificates/verify/${certificateId}`)
        const data = await response.json()
        setResult(data)
      } catch (err) {
        setError('Failed to verify certificate')
      } finally {
        setLoading(false)
      }
    }

    if (certificateId) {
      verifyCertificate()
    }
  }, [certificateId])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate Verification - ${certificateId}`,
        text: `Verify The Noders PTNK certificate: ${certificateId}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text={t.loading} />
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error/20 mb-6">
            <ShieldX className="w-10 h-10 text-error" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            {t.invalid}
          </h1>
          <p className="text-text-secondary mb-8">
            {error || t.invalidDesc}
          </p>
          <Button onClick={() => router.push('/verify')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToVerify}
          </Button>
        </div>
      </div>
    )
  }

  if (!result.valid) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error/20 mb-6">
            <XCircle className="w-10 h-10 text-error" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            {t.invalid}
          </h1>
          <p className="text-text-secondary mb-4">
            {t.invalidDesc}
          </p>
          <div className="p-4 bg-dark-surface rounded-lg mb-8 inline-block">
            <code className="text-xl font-mono text-error">
              {certificateId}
            </code>
          </div>
          <div>
            <Button onClick={() => router.push('/verify')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToVerify}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { certificate, member, issuer } = result
  const socialLinks = member?.social_links as SocialLinks | null

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header - Verification Status + Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToVerify}
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-full">
              <ShieldCheck className="w-5 h-5 text-success" />
              <span className="text-success font-medium">{t.valid}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              {certificate?.file_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(certificate.file_url!, '_blank')}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Layout - Preview + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Certificate Preview - Main Area */}
          <div className="flex-1 min-w-0">
            {certificate?.file_url ? (
              <div className="relative bg-dark-surface/30 rounded-2xl overflow-hidden p-4 lg:p-6">
                {certificate.file_type === 'pdf' ? (
                  <iframe
                    src={certificate.file_url}
                    className="w-full aspect-[2000/1414] rounded-lg"
                    title="Certificate Preview"
                  />
                ) : (
                  <div className="relative w-full aspect-[2000/1414]">
                    <Image
                      src={certificate.file_url}
                      alt="Certificate"
                      fill
                      className="object-contain rounded-lg"
                      sizes="(max-width: 1024px) 100vw, 70vw"
                      priority
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-[2000/1414] bg-dark-surface/30 rounded-2xl">
                <p className="text-text-tertiary">No certificate preview available</p>
              </div>
            )}
          </div>

          {/* Sidebar - Info */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-6">
            {/* Certificate Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {certificate?.title || 'Certificate'}
              </h2>

              {/* Certificate ID */}
              <div className="p-3 bg-primary-blue/10 rounded-xl">
                <code className="text-lg font-mono font-bold text-primary-blue">
                  {certificate?.certificate_id}
                </code>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <p className="text-text-tertiary mb-1">{t.issuedOn}</p>
                  <p className="text-text-primary flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-text-tertiary" />
                    {certificate?.issued_at
                      ? new Date(certificate.issued_at).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-text-tertiary mb-1">{t.generation}</p>
                  <Badge variant="primary">Gen {certificate?.gen_number}</Badge>
                </div>
              </div>

              {issuer && (
                <div className="text-sm">
                  <p className="text-text-tertiary mb-1">{t.issuedBy}</p>
                  <p className="text-text-primary">{issuer.full_name}</p>
                </div>
              )}

              {certificate?.description && (
                <p className="text-sm text-text-secondary">{certificate.description}</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-dark-border" />

            {/* Member Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar
                  name={member?.full_name}
                  src={member?.avatar_url}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">
                    {member?.full_name}
                  </h3>
                  <p className="text-sm text-text-secondary truncate">@{member?.username}</p>
                  <Badge variant="success" size="sm" className="mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t.verifiedBadge}
                  </Badge>
                </div>
              </div>

              {member?.bio && (
                <p className="text-sm text-text-secondary line-clamp-3">{member.bio}</p>
              )}

              {/* Social Links */}
              {socialLinks && Object.keys(socialLinks).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.github && (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-dark-surface hover:bg-dark-border rounded-lg transition-colors"
                    >
                      <Github className="w-4 h-4 text-text-secondary" />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-dark-surface hover:bg-dark-border rounded-lg transition-colors"
                    >
                      <Facebook className="w-4 h-4 text-text-secondary" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-dark-surface hover:bg-dark-border rounded-lg transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-text-secondary" />
                    </a>
                  )}
                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-dark-surface hover:bg-dark-border rounded-lg transition-colors"
                    >
                      <Globe className="w-4 h-4 text-text-secondary" />
                    </a>
                  )}
                </div>
              )}

              {/* View Profile Button */}
              <Link href={`/members/${member?.username}`} className="block">
                <Button variant="secondary" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t.viewProfile}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
