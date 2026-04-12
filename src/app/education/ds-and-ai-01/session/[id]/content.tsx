'use client'

import Link from 'next/link'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '../../locale'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { ArrowLeft, Calendar, Target, Clock, ExternalLink } from 'lucide-react'

interface SessionData {
  canvaUrl: string | null
  youtubeUrl: string | null
  docsUrl: string | null
  colabUrl: string | null
}

const sessionData: Record<number, SessionData> = {
  1: {
    canvaUrl: 'https://www.canva.com/design/DAG6aB5X6q0/9rrWO6b8nUd1G_NSfJvOrA/view?embed',
    youtubeUrl: 'https://www.youtube.com/embed/vGEgixKR8lA',
    docsUrl: 'https://docs.google.com/document/d/e/2PACX-1vSkZwunwjs_JaDrjxMIAKNRTq-unp00QmxSDL6_e6aeiQJppYmVmKdo48udm4KYGehPcRW7ZcDaGAVd/pub?embedded=true',
    colabUrl: null,
  },
  2: {
    canvaUrl: 'https://www.canva.com/design/DAG5xorKDtg/I5_Ma3gPGtLuC4CXcnyWrw/view?embed',
    youtubeUrl: 'https://www.youtube.com/embed/81h3Bysu6oc',
    docsUrl: 'https://docs.google.com/document/d/e/2PACX-1vSKQSyxomwwYJQ4XooC-cBqGKJsaFwOzTtVRwBQPDIt6osNxrzj_LJDd9Sj8mnbD_3RqPxE6oG8Gdau/pub?embedded=true',
    colabUrl: 'https://colab.research.google.com/drive/1An4g-yczGnwz75e0B7Akpezzz8G1XrGX?usp=sharing',
  },
  3: { 
    canvaUrl: 'https://canva.link/r9khsrj8toficy1', 
    youtubeUrl: null, 
    docsUrl: 'https://docs.google.com/document/d/e/2PACX-1vSA4oO7kdPIkTDd5OUd0bMxwBMkqLhU27y5eR9iz2ymTjPUQRCvDpQ6DTGO4Xl_fK1IcyV6ZVlkfgAW/pub?embedded=true', 
    colabUrl: 'https://colab.research.google.com/drive/1lD1AMTLALgHB4AQ8DjQ94N3iBSpeACoO?usp=sharing' 
  },
  4: { canvaUrl: null, youtubeUrl: null, docsUrl: null, colabUrl: null },
}

const sessionDates: Record<number, string> = {
  1: '05/04/2026',
  2: '08/04/2026',
  3: '12/04/2026',
  4: '15/04/2026',
}


function ComingSoonPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[240px] bg-dark-surface/40 border border-dark-border/40 rounded-xl backdrop-blur-md">
      <Clock className="w-10 h-10 text-text-secondary/40 mb-4" />
      <p className="text-text-secondary text-sm font-medium">{label}</p>
      <p className="text-text-secondary/50 text-xs mt-1">Tài liệu sẽ được cập nhật sau buổi học</p>
    </div>
  )
}

export function SessionDetailContent({ sessionId }: { sessionId: string }) {
  const { lang } = useLanguage()
  const t = translations
  const loc = (obj: { en: string; vi: string }) => obj[lang] || obj.en

  const id = parseInt(sessionId, 10)
  const sessionIndex = id - 1

  if (isNaN(id) || id < 1 || id > 4) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Session not found.</p>
          <Link href="/education/ds-and-ai-01">
            <Button variant="secondary">Back to Module 1</Button>
          </Link>
        </div>
      </div>
    )
  }

  const session = sessionData[id]
  const sessionInfo = t.curriculum.sessions[sessionIndex]
  const title = loc(sessionInfo.title)
  const objective = loc(sessionInfo.objective)
  const date = sessionDates[id]

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <NeuralNetworkBackground />

      {/* Header + Canva — narrower container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/education/ds-and-ai-01">
            <Button variant="secondary" className="mb-6 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              {lang === 'vi' ? 'Quay lại Module 1' : 'Back to Module 1'}
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant="default" className="text-primary-blue border border-primary-blue/30 bg-primary-blue/5">
              DS &amp; AI
            </Badge>
            <Badge variant="default" className={`border bg-transparent ${id === 1 ? 'text-accent-cyan border-accent-cyan/30' : id === 2 ? 'text-accent-cyan border-accent-cyan/30' : id === 3 ? 'text-success border-success/30' : 'text-warning border-warning/30'}`}>
              Session {id}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">{title}</h1>

          <div className="flex flex-wrap gap-4">
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-dark-surface/60 text-text-secondary text-sm border border-dark-border/40">
              <Target className="w-4 h-4 mr-2 text-accent-cyan" />
              {objective}
            </div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-dark-surface/60 text-text-secondary text-sm border border-dark-border/40">
              <Calendar className="w-4 h-4 mr-2 text-yellow-300" />
              {date}
            </div>
          </div>
        </div>

        {/* Canva Slide Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">
              {lang === 'vi' ? 'Slide bài giảng' : 'Lecture Slides'}
            </h2>
            {session.canvaUrl && (
              <a
                href={session.canvaUrl.replace('?embed', '')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary-blue hover:text-accent-cyan transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                {lang === 'vi' ? 'Mở trong Canva' : 'Open in Canva'}
              </a>
            )}
          </div>

          {session.canvaUrl ? (
            <div className="relative w-full rounded-2xl overflow-hidden border border-dark-border/40 shadow-2xl bg-dark-surface/20">
              <div className="aspect-video">
                <iframe
                  src={session.canvaUrl}
                  allowFullScreen
                  allow="fullscreen"
                  className="w-full h-full"
                  style={{ border: 'none' }}
                  title={`Session ${id} Slides`}
                />
              </div>
            </div>
          ) : (
            <ComingSoonPlaceholder label={lang === 'vi' ? 'Slide bài giảng' : 'Lecture Slides'} />
          )}
        </section>
      </div>

      {/* Video + Docs — wider container, less padding */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-4 lg:px-6 pb-16">
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            {lang === 'vi' ? 'Video & Tài liệu' : 'Video & Materials'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            {/* YouTube — 60% */}
            <div className="lg:col-span-3 flex flex-col">
              <p className="text-sm text-text-secondary mb-2 font-medium">
                {lang === 'vi' ? 'Video bài giảng' : 'Lecture Recording'}
              </p>
              {session.youtubeUrl ? (
                <div className="rounded-xl overflow-hidden border border-dark-border/40 bg-dark-surface/20">
                  <div className="aspect-video">
                    <iframe
                      src={session.youtubeUrl}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="w-full h-full"
                      style={{ border: 'none' }}
                      title={`Session ${id} Video`}
                    />
                  </div>
                </div>
              ) : (
                <ComingSoonPlaceholder label={lang === 'vi' ? 'Video bài giảng' : 'Lecture Recording'} />
              )}
            </div>

            {/* Google Docs — 40% */}
            <div className="lg:col-span-2 flex flex-col">
              <p className="text-sm text-text-secondary mb-2 font-medium">
                {lang === 'vi' ? 'Tài liệu bài giảng' : 'Lecture Notes'}
              </p>
              {session.docsUrl ? (
                <div className="rounded-xl overflow-hidden border border-dark-border/40 bg-dark-surface/20 flex-1">
                  <iframe
                    src={session.docsUrl}
                    className="w-full h-full"
                    style={{ border: 'none', display: 'block', minHeight: '200px' }}
                    title={`Session ${id} Notes`}
                  />
                </div>
              ) : (
                <ComingSoonPlaceholder label={lang === 'vi' ? 'Tài liệu bài giảng' : 'Lecture Notes'} />
              )}
            </div>
          </div>
        </section>

        {/* Colab Button */}
        {session.colabUrl && (
          <a
            href={session.colabUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-[#F9AB00]/10 hover:bg-[#F9AB00]/20 border border-[#F9AB00]/30 hover:border-[#F9AB00]/60 text-[#F9AB00] font-semibold text-base transition-all duration-200 group"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 1.97a4.079 4.079 0 0 0-5.476 5.476l-1.97 1.97a6.5 6.5 0 0 1 9.416-9.416zm-11.124 7.504 1.97-1.97a4.079 4.079 0 0 0 5.476-5.476l1.97-1.97a6.5 6.5 0 0 1-9.416 9.416z"/>
            </svg>
            {lang === 'vi' ? 'Mở bài Lab trên Google Colab' : 'Open Lab on Google Colab'}
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>
    </div>
  )
}
