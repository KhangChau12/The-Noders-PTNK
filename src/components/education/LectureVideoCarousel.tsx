'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
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

export function LectureVideoCarousel({ videos, lang }: LectureVideoCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const pointerStartXRef = useRef(0)
  const dragDistanceRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [activeThumb, setActiveThumb] = useState<number | null>(null)

  const loopedVideos = useMemo(() => [...videos, ...videos, ...videos], [videos])

  const wrapScrollPosition = (scroller: HTMLDivElement) => {
    const segmentWidth = scroller.scrollWidth / 3
    if (!Number.isFinite(segmentWidth) || segmentWidth <= 0) return

    if (scroller.scrollLeft < segmentWidth) {
      scroller.scrollLeft += segmentWidth
      return
    }
    if (scroller.scrollLeft >= segmentWidth * 2) {
      scroller.scrollLeft -= segmentWidth
    }
  }

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || videos.length === 0) return

    const onScroll = () => wrapScrollPosition(scroller)
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [videos.length])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || videos.length === 0) return

    const setInitialPosition = () => {
      const segmentWidth = scroller.scrollWidth / 3
      if (Number.isFinite(segmentWidth) && segmentWidth > 0) {
        const firstCard = scroller.querySelector<HTMLElement>('[data-video-card]')
        const scrollerStyle = window.getComputedStyle(scroller)
        const gap = parseFloat(scrollerStyle.columnGap || scrollerStyle.gap || '0') || 0
        const firstCardWidth = firstCard?.getBoundingClientRect().width || 0
        const cardStep = firstCardWidth + gap
        const shouldOffsetHalfCard = firstCardWidth > 0 && firstCardWidth <= scroller.clientWidth * 0.75
        const initialOffset = shouldOffsetHalfCard ? cardStep / 2 : 0
        scroller.scrollLeft = segmentWidth + initialOffset
      }
    }

    const rafId = window.requestAnimationFrame(setInitialPosition)
    window.addEventListener('resize', setInitialPosition)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', setInitialPosition)
    }
  }, [videos.length])

  const nudge = (direction: 'prev' | 'next') => {
    const scroller = scrollerRef.current
    if (!scroller) return
    wrapScrollPosition(scroller)
    const firstCard = scroller.querySelector<HTMLElement>('[data-video-card]')
    const scrollerStyle = window.getComputedStyle(scroller)
    const gap = parseFloat(scrollerStyle.columnGap || scrollerStyle.gap || '0') || 0
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : scroller.clientWidth
    scroller.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' })
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
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
    wrapScrollPosition(scroller)
    pointerStartXRef.current = e.clientX
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false)
    scrollerRef.current?.releasePointerCapture(e.pointerId)
    if (scrollerRef.current) wrapScrollPosition(scrollerRef.current)
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
    <div className="relative overflow-hidden rounded-3xl border border-dark-border/70 bg-gradient-to-br from-dark-surface/80 to-dark-bg/90 shadow-2xl shadow-primary-blue/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.1),_transparent_30%)]" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-4 sm:gap-4 sm:px-5 sm:pt-5 md:px-6 md:pt-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-blue mb-1">
            {loc(label.heading)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => nudge('prev')}
            className="border border-dark-border/80 bg-dark-bg/60 backdrop-blur-md hover:bg-dark-border/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => nudge('next')}
            className="border border-dark-border/80 bg-dark-bg/60 backdrop-blur-md hover:bg-dark-border/60"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative z-10 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-4 md:px-6 md:pb-6">
        <div
          ref={scrollerRef}
          className={`no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto pb-2 [scrollbar-width:none] ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClickCapture={handleClickCapture}
          style={{ touchAction: 'pan-y' }}
        >
          {loopedVideos.map((video, index) => {
            const isOriginal = index >= videos.length && index < videos.length * 2
            const thumbActive = activeThumb === index

            return (
              <Card
                key={`${video.sessionNumber}-${index}`}
                variant="interactive"
                padding="none"
                data-video-card="true"
                aria-hidden={!isOriginal}
                className="group/card relative flex-shrink-0 overflow-hidden border border-dark-border/70 bg-dark-surface/95 shadow-xl shadow-black/10 w-[92%] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
              >
                <div className="flex h-full flex-col">
                  {/* Video Thumbnail / Player */}
                  <div className="relative aspect-video overflow-hidden bg-dark-bg/60">
                    {thumbActive ? (
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
                        {/* YouTube thumbnail via nocookie */}
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeEmbedUrl.split('/embed/')[1]}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-[1.03]"
                          loading={index < videos.length ? 'eager' : 'lazy'}
                        />
                        {/* Gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient} opacity-40`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />

                        {/* Play button */}
                        <button
                          onClick={() => setActiveThumb(index)}
                          className="absolute inset-0 flex items-center justify-center group/play"
                          aria-label={`Play session ${video.sessionNumber}`}
                          tabIndex={isOriginal ? 0 : -1}
                        >
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-primary-blue/80 group-hover/play:border-primary-blue">
                            <Play className="w-6 h-6 text-white fill-white translate-x-0.5" />
                          </div>
                        </button>

                        {/* Session badge */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-dark-bg/70 backdrop-blur-md border border-white/10 text-white">
                            {loc(label.session)} {video.sessionNumber}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card Body */}
                  <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
                    <p className="text-xs text-text-secondary mb-1">{video.date}</p>
                    <h3 className="mb-3 text-base font-bold leading-snug text-text-primary group-hover/card:text-primary-blue transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => setActiveThumb(index)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 border border-primary-blue/30 hover:border-primary-blue/60 text-primary-blue text-xs font-semibold transition-all"
                        tabIndex={isOriginal ? 0 : -1}
                      >
                        <Play className="w-3 h-3 fill-primary-blue" />
                        {loc(label.watchVideo)}
                      </button>
                      <Link
                        href={video.sessionUrl}
                        className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-dark-surface/60 hover:bg-dark-surface border border-dark-border/60 hover:border-dark-border text-text-secondary hover:text-text-primary text-xs font-medium transition-all"
                        tabIndex={isOriginal ? 0 : -1}
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

        <div className="mt-3 text-xs text-text-tertiary">
          {loc(label.dragHint)}
        </div>
      </div>
    </div>
  )
}
