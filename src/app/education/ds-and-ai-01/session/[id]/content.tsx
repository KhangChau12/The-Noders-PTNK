'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '../../locale'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { ArrowLeft, ArrowRight, Calendar, Target, Clock, ExternalLink, Presentation, PlayCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    canvaUrl: 'https://www.canva.com/design/DAG6gEMB0TM/jGfQyCUd3g1brWst6WF_9w/view?embed',
    youtubeUrl: 'https://www.youtube.com/embed/jSQLXLTBEhE',
    docsUrl: 'https://docs.google.com/document/d/e/2PACX-1vSA4oO7kdPIkTDd5OUd0bMxwBMkqLhU27y5eR9iz2ymTjPUQRCvDpQ6DTGO4Xl_fK1IcyV6ZVlkfgAW/pub?embedded=true',
    colabUrl: 'https://colab.research.google.com/drive/1lD1AMTLALgHB4AQ8DjQ94N3iBSpeACoO?usp=sharing',
  },
  4: {
    canvaUrl: 'https://www.canva.com/design/DAG8VnHsx_8/99IxQ-xH48xY4hfG9USddg/view?embed',
    youtubeUrl: 'https://www.youtube.com/embed/TvU_e2Kvp_Y',
    docsUrl: 'https://docs.google.com/document/d/e/2PACX-1vScKMjc_YQMo-s-3-8wdkhTGyg8-0yN4ti52thiyH3EQ1B6sb6FP4pGI8kMI4iY2Q5jmsB6qjFxK56U/pub?embedded=true',
    colabUrl: 'https://colab.research.google.com/drive/1zKTsGbxZC97R6mrROg6V4F5hZKPDGmW6?usp=sharing',
  },
}

const sessionDates: Record<number, string> = {
  1: '05/04/2026',
  2: '08/04/2026',
  3: '12/04/2026',
  4: '15/04/2026',
}

type MaterialTab = 'slides' | 'video' | 'notes'

function ComingSoonPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] bg-dark-bg/40 rounded-b-2xl">
      <Clock className="w-9 h-9 text-text-secondary/40 mb-3" />
      <p className="text-text-secondary text-sm font-medium">{label}</p>
      <p className="text-text-secondary/50 text-xs mt-1">
        {'Available after the session'}
      </p>
    </div>
  )
}

export function SessionDetailContent({ sessionId }: { sessionId: string }) {
  const { lang } = useLanguage()
  const t = translations
  const loc = (obj: { en: string; vi: string }) => obj[lang] || obj.en

  const id = parseInt(sessionId, 10)
  const sessionIndex = id - 1
  const [activeTab, setActiveTab] = useState<MaterialTab>('slides')

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

  const tabs: { key: MaterialTab; label: string; icon: React.ReactNode }[] = [
    { key: 'slides', label: lang === 'vi' ? 'Slide' : 'Slides', icon: <Presentation className="w-4 h-4" /> },
    { key: 'video', label: lang === 'vi' ? 'Bài giảng' : 'Recording', icon: <PlayCircle className="w-4 h-4" /> },
    { key: 'notes', label: lang === 'vi' ? 'Tài liệu' : 'Notes', icon: <FileText className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <NeuralNetworkBackground />

      <div className="relative z-10 container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-14 sm:pb-16">
        <Link href="/education/ds-and-ai-01">
          <Button variant="secondary" className="mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {lang === 'vi' ? 'Quay lại Module 1' : 'Back to Module 1'}
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="default" className="!rounded-[7px] text-primary-blue border border-primary-blue/30 bg-primary-blue/5">
            DS &amp; AI
          </Badge>
          <Badge variant="default" className="!rounded-[7px] border bg-transparent text-accent-cyan border-accent-cyan/30">
            Session {id}
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight break-words">{title}</h1>

        <div className="flex flex-wrap gap-2.5 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border/60 text-text-secondary text-xs">
            <Target className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
            <span className="break-words">{objective}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border/60 text-text-secondary text-xs">
            <Calendar className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
            {date}
          </div>
        </div>

        {/* Material viewer — one tabbed panel instead of three stacked
            full-width iframes (Canva, YouTube, Google Docs) in sequence. */}
        <div className="flex gap-1 border-b border-dark-border/60">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors',
                activeTab === tab.key ? 'text-text-primary border-primary-blue' : 'text-text-tertiary border-transparent hover:text-text-secondary'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-b-2xl border border-t-0 border-dark-border/60 bg-dark-surface overflow-hidden">
          {activeTab === 'slides' && (
            session.canvaUrl ? (
              <>
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={session.canvaUrl}
                    loading="lazy"
                    allowFullScreen
                    allow="fullscreen"
                    className="absolute inset-0 w-full h-full border-0"
                    title={`Session ${id} Slides`}
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-dark-border/60">
                  <span className="text-xs text-text-tertiary">{lang === 'vi' ? 'Slide bài giảng' : 'Lecture Slides'}</span>
                  <a
                    href={session.canvaUrl.replace('?embed', '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-cyan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {lang === 'vi' ? 'Mở trong Canva' : 'Open in Canva'}
                  </a>
                </div>
              </>
            ) : (
              <ComingSoonPlaceholder label={lang === 'vi' ? 'Slide bài giảng' : 'Lecture Slides'} />
            )
          )}

          {activeTab === 'video' && (
            session.youtubeUrl ? (
              <>
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={session.youtubeUrl}
                    loading="lazy"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="absolute inset-0 w-full h-full border-0"
                    title={`Session ${id} Video`}
                  />
                </div>
                <div className="flex items-center px-4 py-3 border-t border-dark-border/60">
                  <span className="text-xs text-text-tertiary">{lang === 'vi' ? 'Video bài giảng' : 'Lecture Recording'}</span>
                </div>
              </>
            ) : (
              <ComingSoonPlaceholder label={lang === 'vi' ? 'Video bài giảng' : 'Lecture Recording'} />
            )
          )}

          {activeTab === 'notes' && (
            session.docsUrl ? (
              <>
                <div className="relative h-[480px] sm:h-[560px] bg-white">
                  <iframe
                    src={session.docsUrl}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full border-0"
                    title={`Session ${id} Notes`}
                  />
                </div>
                <div className="flex items-center px-4 py-3 border-t border-dark-border/60">
                  <span className="text-xs text-text-tertiary">{lang === 'vi' ? 'Tài liệu bài giảng' : 'Lecture Notes'}</span>
                </div>
              </>
            ) : (
              <ComingSoonPlaceholder label={lang === 'vi' ? 'Tài liệu bài giảng' : 'Lecture Notes'} />
            )
          )}
        </div>

        {session.colabUrl && (
          <a
            href={session.colabUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-[#F9AB00]/10 hover:bg-[#F9AB00]/20 border border-[#F9AB00]/30 hover:border-[#F9AB00]/60 text-[#F9AB00] font-semibold text-sm transition-all duration-200 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 1.97a4.079 4.079 0 0 0-5.476 5.476l-1.97 1.97a6.5 6.5 0 0 1 9.416-9.416zm-11.124 7.504 1.97-1.97a4.079 4.079 0 0 0 5.476-5.476l1.97-1.97a6.5 6.5 0 0 1-9.416 9.416z" />
            </svg>
            {lang === 'vi' ? 'Mở bài Lab trên Google Colab' : 'Open Lab on Google Colab'}
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}

        {/* Prev/next session navigation — this is one of a numbered 4-session sequence */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-dark-border/60">
          {id > 1 ? (
            <Link href={`/education/ds-and-ai-01/session/${id - 1}`} className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary-blue transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {lang === 'vi' ? `Buổi ${id - 1}` : `Session ${id - 1}`}
            </Link>
          ) : <span />}
          {id < 4 ? (
            <Link href={`/education/ds-and-ai-01/session/${id + 1}`} className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary-blue transition-colors">
              {lang === 'vi' ? `Buổi ${id + 1}` : `Session ${id + 1}`}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  )
}
