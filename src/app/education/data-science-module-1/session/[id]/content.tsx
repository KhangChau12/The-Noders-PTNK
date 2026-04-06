'use client'

import Link from 'next/link'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '../../locale'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { ArrowLeft, Calendar, Target, Clock, ExternalLink } from 'lucide-react'

interface SessionData {
  canvaUrl: string | null
  youtubeUrl: string | null
  docsUrl: string | null
}

const sessionData: Record<number, SessionData> = {
  1: {
    canvaUrl: 'https://www.canva.com/design/DAG6aB5X6q0/9rrWO6b8nUd1G_NSfJvOrA/view?embed',
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    docsUrl: 'https://docs.google.com/document/d/e/2PACX-1vSkZwunwjs_JaDrjxMIAKNRTq-unp00QmxSDL6_e6aeiQJppYmVmKdo48udm4KYGehPcRW7ZcDaGAVd/pub?embedded=true',
  },
  2: { canvaUrl: null, youtubeUrl: null, docsUrl: null },
  3: { canvaUrl: null, youtubeUrl: null, docsUrl: null },
  4: { canvaUrl: null, youtubeUrl: null, docsUrl: null },
}

const sessionDates: Record<number, string> = {
  1: '05/04/2026',
  2: '08/04/2026',
  3: '12/04/2026',
  4: '15/04/2026',
}

const sessionGradients: Record<number, string> = {
  1: 'from-primary-blue/20 to-accent-cyan/10',
  2: 'from-accent-cyan/20 to-primary-blue/10',
  3: 'from-success/20 to-accent-cyan/10',
  4: 'from-warning/20 to-success/10',
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
          <Link href="/education/data-science-module-1">
            <Button variant="outline">Back to Module 1</Button>
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
  const gradient = sessionGradients[id]

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <NeuralNetworkBackground />

      {/* Header + Canva — narrower container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/education/data-science-module-1">
            <Button variant="outline" className="mb-6 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              {lang === 'vi' ? 'Quay lại Module 1' : 'Back to Module 1'}
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant="default" className="text-primary-blue border border-primary-blue/30 bg-primary-blue/5">
              Data Science Module 1
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
      </div>
    </div>
  )
}
