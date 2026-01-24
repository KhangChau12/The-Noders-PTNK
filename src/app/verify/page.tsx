'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import {
  Award,
  Search,
  ShieldCheck,
  ArrowRight,
  Info,
  CheckCircle2,
  Lock,
  FileCheck
} from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

const locale = {
  en: {
    title: 'Certificate Verification',
    subtitle: 'Verify the authenticity and validity of The Noders PTNK certificates',
    placeholder: 'Enter certificate ID (e.g., TN-GEN0-H8AU)',
    verify: 'Verify Certificate',
    help: 'Where is my ID?',
    helpText: 'Found at the bottom left of your certificate.',
    format: 'ID Format Guide',
    formatExample: 'TN-GEN0-ABCD',
    formatDesc: 'The Noders ID structure',
    invalid: 'Please enter a valid certificate ID format',
    features: {
      title: 'Verification Coverage',
      items: [
        'Official Authenticity Signature',
        'Member Profile Validation',
        'Issue Date & Expiry Check',
        'Generation Status confirmation'
      ]
    }
  },
  vi: {
    title: 'Tra cứu chứng chỉ',
    subtitle: 'Hệ thống xác thực và kiểm tra thông tin chứng chỉ The Noders PTNK',
    placeholder: 'Nhập mã chứng chỉ (VD: TN-GEN0-H8AU)',
    verify: 'Kiểm tra ngay',
    help: 'Mã ID ở đâu?',
    helpText: 'Mã ID nằm ở góc dưới bên trái của chứng chỉ.',
    format: 'Cấu trúc mã ID',
    formatExample: 'TN-GEN0-ABCD',
    formatDesc: 'Cấu trúc định danh The Noders',
    invalid: 'Vui lòng nhập đúng định dạng mã chứng chỉ',
    features: {
      title: 'Thông tin xác thực',
      items: [
        'Chữ ký số xác thực từ Ban điều hành',
        'Đối chiếu hồ sơ thành viên gốc',
        'Kiểm tra ngày cấp và hiệu lực',
        'Xác nhận thế hệ và phân quyền'
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
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-blue/20 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-text-primary mb-6 tracking-tight">
              {t.title}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Main Verification Input */}
          <div className="max-w-2xl mx-auto mb-16 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-blue via-accent-purple to-accent-pink rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <Card className="relative border-dark-border/50 bg-dark-bg/80 backdrop-blur-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
                      Certificate ID
                    </label>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Input
                          value={certificateId}
                          onChange={(e) => {
                            setCertificateId(e.target.value.toUpperCase())
                            setError('')
                          }}
                          placeholder={t.placeholder}
                          className="h-14 text-lg font-mono uppercase bg-dark-surface border-dark-border focus:border-primary-blue pl-12 transition-all"
                          icon={<Award className="w-6 h-6 text-text-tertiary" />}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="h-14 px-8 text-lg bg-primary-blue hover:bg-primary-blue/90 shadow-lg shadow-primary-blue/25 transition-all hover:scale-105"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        {t.verify}
                      </Button>
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 mt-3 text-red-500 bg-red-500/10 p-3 rounded-lg text-sm border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                         {error}
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Format Card */}
            <Card className="bg-dark-surface/50 border-dark-border/50 hover:border-primary-blue/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-primary-blue/10">
                    <Info className="w-5 h-5 text-primary-blue" />
                  </div>
                  <h3 className="font-semibold text-text-primary">{t.format}</h3>
                </div>
                <div className="bg-dark-bg p-3 rounded-md border border-dark-border mb-3 text-center">
                   <code className="text-xl font-mono font-bold text-primary-blue tracking-wide">{t.formatExample}</code>
                </div>
                <p className="text-sm text-text-secondary">{t.formatDesc}</p>
              </CardContent>
            </Card>

            {/* Help Card */}
             <Card className="bg-dark-surface/50 border-dark-border/50 hover:border-accent-purple/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-accent-purple/10">
                    <CheckCircle2 className="w-5 h-5 text-accent-purple" />
                  </div>
                  <h3 className="font-semibold text-text-primary">{t.help}</h3>
                </div>
                 <p className="text-sm text-text-secondary leading-relaxed flex items-start gap-2">
                    <span className="mt-1 text-accent-purple">•</span>
                    {t.helpText}
                 </p>
                 <div className="mt-4 text-xs text-text-tertiary">
                    Example: <span className="text-text-secondary">TN-GEN5-X9Y2</span>
                 </div>
              </CardContent>
            </Card>

            {/* Features Card - Spans 1 col on desktop */}
            <Card className="bg-dark-surface/50 border-dark-border/50 hover:border-accent-green/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2.5 rounded-lg bg-accent-green/10">
                    <Lock className="w-5 h-5 text-accent-green" />
                  </div>
                  <h3 className="font-semibold text-text-primary">{t.features.title}</h3>
                </div>
                <ul className="space-y-2">
                  {t.features.items.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                      <FileCheck className="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1" title={item}>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

