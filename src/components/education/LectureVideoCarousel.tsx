'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/Card'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react'

interface LectureVideo {
  sessionNumber: number
  title: string
  date: string
  youtubeEmbedUrl: string
  sessionUrl: string
  gradient: string
}

interface LectureVideoCarouselProps {
  videos: LectureVideo[]
  lang: 'en' | 'vi'
}

// A straight (non-looping) horizontal scroller — with only 4 sessions,
// looping added complexity (a tripled video array, wrap-around scroll math)
// without real benefit, and made the edge cards render half-cut-off.
export function LectureVideoCarousel({ videos, lang }: LectureVideoCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const pointerStartXRef = useRef(0)
  const dragDistanceRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)

  const nudge = (direction: 'prev' | 'next') => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const firstCard = scroller.querySelector<HTMLElement>('[data-video-card]')
    const gap = parseFloat(window.getComputedStyle(scroller).columnGap || '0') || 0
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : scroller.clientWidth
    scroller.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' })
  }

  const playSession = (index: number) => {
    setPlayingIndex(index)
    // Bring the card fully into view — this is what was missing before:
    // the state changed but a card sitting outside the viewport gave no
    // visible feedback that anything happened.
    const card = scrollerRef.current?.querySelectorAll<HTMLElement>('[data-video-card]')[index]
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Don't start drag-tracking (and don't capture the pointer) when the
    // press starts on a button or link — otherwise a plain click on "Watch
    // Recording"/"Session Details" gets its pointer captured by the
    // scroller and the click never reaches the control.
    if ((e.target as HTMLElement).closest('button, a')) return

    dragDistanceRef.current = 0
    pointerStartXRef.current = e.clientX
    setIsDragging(true)
    scrollerRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller || !isDragging) return
    const deltaX = e.clientX - pointerStartXRef.current
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(deltaX))
    scroller.scrollLeft -= deltaX
    pointerStartXRef.current = e.clientX
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false)
    scrollerRef.current?.releasePointerCapture(e.pointerId)
  }

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragDistanceRef.current > 6) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const label = {
    heading: { en: 'Lecture Recordings', vi: 'Video bài giảng' },
    session: { en: 'Session', vi: 'Buổi' },
    watchVideo: { en: 'Watch Recording', vi: 'Xem bài giảng' },
    viewDetails: { en: 'Session Details', vi: 'Chi tiết buổi học' },
    dragHint: { en: 'Drag or use arrows to browse sessions', vi: 'Kéo hoặc dùng mũi tên để duyệt' },
  }
  const loc = (obj: { en: string; vi: string }) => obj[lang]

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-blue">
          {loc(label.heading)}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => nudge('prev')}
            aria-label={lang === 'vi' ? 'Buổi trước' : 'Previous session'}
            className="w-9 h-9 rounded-full border border-dark-border/70 bg-dark-surface flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary-blue/50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => nudge('next')}
            aria-label={lang === 'vi' ? 'Buổi tiếp theo' : 'Next session'}
            className="w-9 h-9 rounded-full border border-dark-border/70 bg-dark-surface flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary-blue/50 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          'no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto pb-2 [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0',
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
        style={{ touchAction: 'pan-y' }}
      >
        {videos.map((video, index) => {
          const isPlaying = playingIndex === index

          return (
            <Card
              key={video.sessionNumber}
              variant="interactive"
              padding="none"
              data-video-card="true"
              className="group/card relative flex-shrink-0 overflow-hidden border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm w-[85%] xs:w-[78%] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            >
              <div className="flex h-full flex-col">
                <div className="relative aspect-video overflow-hidden bg-dark-bg/60">
                  {isPlaying ? (
                    <iframe
                      src={`${video.youtubeEmbedUrl}?autoplay=1&rel=0`}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="w-full h-full"
                      style={{ border: 'none' }}
                      title={`Session ${video.sessionNumber} Video`}
                    />
                  ) : (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeEmbedUrl.split('/embed/')[1]}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-[1.03]"
                        loading="lazy"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient} opacity-40`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />

                      <button
                        type="button"
                        onClick={() => playSession(index)}
                        className="absolute inset-0 flex items-center justify-center group/play"
                        aria-label={`${loc(label.watchVideo)} — ${loc(label.session)} ${video.sessionNumber}`}
                      >
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-primary-blue/80 group-hover/play:border-primary-blue">
                          <Play className="w-6 h-6 text-white fill-white translate-x-0.5" />
                        </div>
                      </button>

                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-dark-bg/70 backdrop-blur-md border border-white/10 text-white">
                          {loc(label.session)} {video.sessionNumber}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="text-xs text-text-secondary mb-1">{video.date}</p>
                  <h3 className="mb-3 text-base font-bold leading-snug text-text-primary group-hover/card:text-primary-blue transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="mt-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => playSession(index)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[44px] rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 border border-primary-blue/30 hover:border-primary-blue/60 text-primary-blue text-xs font-semibold transition-all"
                    >
                      <Play className="w-3 h-3 fill-primary-blue" />
                      {loc(label.watchVideo)}
                    </button>
                    <Link
                      href={video.sessionUrl}
                      className="inline-flex items-center justify-center gap-1 py-2.5 px-3 min-h-[44px] rounded-lg bg-dark-surface hover:bg-dark-border/60 border border-dark-border/60 hover:border-dark-border text-text-secondary hover:text-text-primary text-xs font-medium transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {loc(label.viewDetails)}
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-text-tertiary">
        {loc(label.dragHint)}
      </p>
    </div>
  )
}
