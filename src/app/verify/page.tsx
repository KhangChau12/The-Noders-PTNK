'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import {
  ShieldCheck,
  Search,
  Info,
  CheckCircle2,
  FileCheck,
  BadgeCheck,
  ScanLine
} from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

const locale = {
  en: {
    title: 'Certificate Verification',
    subtitle: 'Validate certificate authenticity issued by The Noders Community in a few seconds.',
    placeholder: 'Enter certificate ID (e.g., C0007)',
    verify: 'Verify Certificate',
    format: 'ID Format',
    formatExample: 'C0007',
    formatDesc: 'One letter C + 4 digits, from C0000 to C9999.',
    invalid: 'Please enter a valid certificate ID (C0000-C9999).',
    helperTitle: 'Where to find the ID?',
    helperDesc: 'The certificate ID appears at the lower-left area of each certificate file.',
    verifiedTitle: 'What will be checked',
    stepsTitle: 'How verification works',
    steps: [
      'Enter the certificate ID and submit verification.',
      'The system checks against official records in the database.',
      'You receive certificate details and member identity results.'
    ],
    trustTitle: 'Official verification portal',
    trustDesc: 'Built for transparent validation across education and competition certificates.',
    features: {
      title: 'Verification Coverage',
      items: [
        'Certificate identity and title',
        'Issued date and certificate file',
        'Member profile mapping'
      ]
    }
  },
  vi: {
    title: 'Tra cứu chứng chỉ',
    subtitle: 'Xác thực nhanh tính hợp lệ của chứng chỉ do The Noders Community cấp.',
    placeholder: 'Nhập mã chứng chỉ (VD: C0007)',
    verify: 'Kiểm tra ngay',
    format: 'Định dạng mã',
    formatExample: 'C0007',
    formatDesc: '1 chữ C + 4 chữ số, từ C0000 đến C9999.',
    invalid: 'Vui lòng nhập đúng mã chứng chỉ (C0000-C9999).',
    helperTitle: 'Tìm mã chứng chỉ ở đâu?',
    helperDesc: 'Mã chứng chỉ nằm ở khu vực góc dưới bên trái trên file chứng chỉ.',
    verifiedTitle: 'Thông tin sẽ được đối chiếu',
    stepsTitle: 'Quy trình xác thực',
    steps: [
      'Nhập mã chứng chỉ và gửi yêu cầu xác thực.',
      'Hệ thống đối chiếu với dữ liệu chứng chỉ chính thức.',
      'Trả về kết quả xác thực và thông tin thành viên liên quan.'
    ],
    trustTitle: 'Cổng xác thực chính thức',
    trustDesc: 'Được xây dựng để minh bạch việc xác thực chứng chỉ học tập và thi đấu.',
    features: {
      title: 'Thông tin xác thực',
      items: [
        'Mã chứng chỉ và tên chứng chỉ',
        'Ngày cấp và tệp chứng chỉ',
        'Đối chiếu hồ sơ thành viên'
      ]
    }
  }
}

export default function VerifyPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = locale[language as keyof typeof locale] || locale.en

  const [certificateId, setCertificateId] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const id = certificateId.trim().toUpperCase()

    // Validate format: C0000 - C9999
    const pattern = /^C\d{4}$/
    if (!pattern.test(id)) {
      setError(t.invalid)
      return
    }

    router.push(`/verify/${id}`)
  }

  const normalizedPreview = certificateId.trim().toUpperCase()

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute top-24 left-1/4 w-80 h-80 bg-primary-blue/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-blue/10 border border-primary-blue/20 text-primary-blue text-sm font-medium mb-5">
              <ShieldCheck className="w-4 h-4" />
              {t.trustTitle}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-text-primary tracking-tight mb-4">
              {t.title}
            </h1>
            <p className="text-text-secondary text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <Card className="lg:col-span-7 bg-dark-bg/75 backdrop-blur-xl border-dark-border/60">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-text-primary mb-2">
                      {t.verify}
                    </h2>
                    <p className="text-sm md:text-base text-text-secondary">
                      {t.trustDesc}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    value={certificateId}
                    onChange={(e) => {
                      setCertificateId(e.target.value.toUpperCase())
                      setError('')
                    }}
                    placeholder={t.placeholder}
                    className="h-14 text-lg font-mono tracking-wide uppercase"
                    icon={<ScanLine className="w-5 h-5" />}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="text-text-tertiary">
                      {t.format}: <span className="text-primary-blue font-mono font-semibold">{t.formatExample}</span>
                    </div>
                    {normalizedPreview && (
                      <div className="px-3 py-1.5 rounded-md border border-primary-blue/30 bg-primary-blue/10 text-primary-blue font-mono font-semibold">
                        {normalizedPreview}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-error/30 bg-error/10 text-error text-sm">
                      <Info className="w-4 h-4 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full md:w-auto md:min-w-[220px] h-12">
                    <Search className="w-4 h-4 mr-2" />
                    {t.verify}
                  </Button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="rounded-xl border border-dark-border bg-dark-surface/50 p-4">
                    <div className="flex items-center gap-2 mb-2 text-text-primary font-medium">
                      <Info className="w-4 h-4 text-primary-blue" />
                      {t.helperTitle}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{t.helperDesc}</p>
                  </div>

                  <div className="rounded-xl border border-dark-border bg-dark-surface/50 p-4">
                    <div className="flex items-center gap-2 mb-2 text-text-primary font-medium">
                      <BadgeCheck className="w-4 h-4 text-accent-green" />
                      {t.verifiedTitle}
                    </div>
                    <ul className="space-y-2">
                      {t.features.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-accent-green flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-5 bg-dark-surface/70 border-dark-border/60">
              <CardContent className="p-6 md:p-8 h-full">
                <h3 className="text-lg md:text-xl font-semibold text-text-primary mb-4">
                  {t.stepsTitle}
                </h3>

                <div className="space-y-4 mb-8">
                  {t.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-dark-border bg-dark-bg/60">
                      <div className="w-7 h-7 rounded-full bg-primary-blue/15 text-primary-blue text-sm font-semibold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-primary-blue/20 bg-gradient-to-br from-primary-blue/10 to-transparent p-5">
                  <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">
                    {t.format}
                  </h4>
                  <div className="font-mono text-3xl font-bold text-primary-blue tracking-wider mb-2">
                    {t.formatExample}
                  </div>
                  <p className="text-sm text-text-secondary mb-4">
                    {t.formatDesc}
                  </p>
                  <div className="text-xs text-text-tertiary flex items-center gap-2">
                    <FileCheck className="w-3.5 h-3.5" />
                    {t.features.title}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

