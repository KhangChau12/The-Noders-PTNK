'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import {
  Award,
  Search,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

const locale = {
  en: {
    title: 'Certificate Verification',
    subtitle: 'Verify the authenticity of The Noders PTNK certificates',
    placeholder: 'Enter certificate ID (e.g., TN-GEN0-H8AU)',
    verify: 'Verify Certificate',
    help: 'How to find your certificate ID?',
    helpText: 'The certificate ID is printed on the bottom of your certificate in the format TN-GEN{X}-{XXXX}',
    format: 'Certificate ID Format',
    formatExample: 'TN-GEN0-ABCD',
    formatDesc: 'TN = The Noders, GEN{X} = Generation number, {XXXX} = Unique code',
    invalid: 'Please enter a valid certificate ID',
    features: {
      title: 'What you can verify',
      items: [
        'Authentic certificate from The Noders PTNK',
        'Member information and profile',
        'Certificate issue date',
        'Generation and membership status'
      ]
    }
  },
  vi: {
    title: 'Xác thực chứng chỉ',
    subtitle: 'Xác minh tính xác thực của chứng chỉ The Noders PTNK',
    placeholder: 'Nhập mã chứng chỉ (VD: TN-GEN0-H8AU)',
    verify: 'Xác thực',
    help: 'Tìm mã chứng chỉ ở đâu?',
    helpText: 'Mã chứng chỉ được in ở cuối chứng chỉ của bạn theo định dạng TN-GEN{X}-{XXXX}',
    format: 'Định dạng mã chứng chỉ',
    formatExample: 'TN-GEN0-ABCD',
    formatDesc: 'TN = The Noders, GEN{X} = Số thế hệ, {XXXX} = Mã duy nhất',
    invalid: 'Vui lòng nhập mã chứng chỉ hợp lệ',
    features: {
      title: 'Thông tin có thể xác minh',
      items: [
        'Chứng chỉ chính thức từ The Noders PTNK',
        'Thông tin và hồ sơ thành viên',
        'Ngày cấp chứng chỉ',
        'Thế hệ và tình trạng thành viên'
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

    // Validate format: TN-GEN{X}-{XXXX}
    const pattern = /^TN-GEN\d+-[A-Z0-9]{4}$/
    if (!pattern.test(id)) {
      setError(t.invalid)
      return
    }

    router.push(`/verify/${id}`)
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-blue to-accent-purple mb-6">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Verification Form */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Certificate ID
                </label>
                <div className="flex gap-4">
                  <Input
                    value={certificateId}
                    onChange={(e) => {
                      setCertificateId(e.target.value.toUpperCase())
                      setError('')
                    }}
                    placeholder={t.placeholder}
                    className="flex-1 font-mono text-lg uppercase"
                    icon={<Award className="w-5 h-5" />}
                  />
                  <Button type="submit" size="lg">
                    <Search className="w-5 h-5 mr-2" />
                    {t.verify}
                  </Button>
                </div>
                {error && (
                  <p className="text-error text-sm mt-2">{error}</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="w-5 h-5 text-primary-blue" />
                {t.format}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-dark-surface rounded-lg mb-4">
                <code className="text-2xl font-mono text-primary-blue font-bold">
                  {t.formatExample}
                </code>
              </div>
              <p className="text-text-secondary text-sm">
                {t.formatDesc}
              </p>
              <div className="mt-4 p-4 bg-primary-blue/10 border border-primary-blue/20 rounded-lg">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">{t.help}</strong>
                  <br />
                  {t.helpText}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="w-5 h-5 text-success" />
                {t.features.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {t.features.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowRight className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
