'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight, Newspaper } from 'lucide-react'

type CommunityPost = {
  id: string
  title: string
  summary: string
  slug: string
  category: string
  reading_time: number
  published_at: string
  thumbnail_image?: {
    public_url?: string
    alt_text?: string | null
  }
}

interface CommunityUpdatesCarouselProps {
  posts: CommunityPost[]
}

const AUTOPLAY_SPEED_PX_PER_SEC = 48
const AUTOPLAY_PAUSE_AFTER_INTERACTION = 7000

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CommunityUpdatesCarousel({ posts }: CommunityUpdatesCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const interactionTimeoutRef = useRef<number | null>(null)
  const pointerStartXRef = useRef(0)
  const pointerStartScrollLeftRef = useRef(0)
  const dragDistanceRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const loopedPosts = useMemo(() => [...posts, ...posts, ...posts], [posts])

  const wrapScrollPosition = (scroller: HTMLDivElement) => {
    const segmentWidth = scroller.scrollWidth / 3
    if (!Number.isFinite(segmentWidth) || segmentWidth <= 0) return

    if (scroller.scrollLeft < segmentWidth) {
      scroller.scrollLeft = scroller.scrollLeft + segmentWidth
      return
    }

    if (scroller.scrollLeft >= segmentWidth * 2) {
      scroller.scrollLeft = scroller.scrollLeft - segmentWidth
    }
  }

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || posts.length === 0) return

    let animationFrame = 0
    let lastTick = performance.now()

    const tick = (timestamp: number) => {
      const deltaSeconds = Math.max(0, (timestamp - lastTick) / 1000)
      lastTick = timestamp

      if (!isPaused && !isDragging && scroller) {
        scroller.scrollLeft += AUTOPLAY_SPEED_PX_PER_SEC * deltaSeconds
        wrapScrollPosition(scroller)
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    animationFrame = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [isPaused, isDragging, posts.length])

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        window.clearTimeout(interactionTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || posts.length === 0) return

    const onScroll = () => wrapScrollPosition(scroller)
    scroller.addEventListener('scroll', onScroll, { passive: true })

    return () => scroller.removeEventListener('scroll', onScroll)
  }, [posts.length])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || posts.length === 0) return

    const setInitialPosition = () => {
      const segmentWidth = scroller.scrollWidth / 3
      if (Number.isFinite(segmentWidth) && segmentWidth > 0) {
        scroller.scrollLeft = segmentWidth
      }
    }

    // Wait one frame so layout widths are measured correctly.
    const rafId = window.requestAnimationFrame(setInitialPosition)
    window.addEventListener('resize', setInitialPosition)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', setInitialPosition)
    }
  }, [posts.length])

  const nudge = (direction: 'prev' | 'next') => {
    const scroller = scrollerRef.current
    if (!scroller) return

    wrapScrollPosition(scroller)

    const firstCard = scroller.querySelector<HTMLElement>('[data-carousel-card]')
    const gap = 24
    const step = firstCard ? firstCard.offsetWidth + gap : scroller.clientWidth * 0.5

    setIsPaused(true)
    if (interactionTimeoutRef.current) {
      window.clearTimeout(interactionTimeoutRef.current)
    }

    scroller.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    })

    window.setTimeout(() => {
      const current = scrollerRef.current
      if (current) {
        wrapScrollPosition(current)
      }
    }, 420)

    interactionTimeoutRef.current = window.setTimeout(() => {
      setIsPaused(false)
    }, AUTOPLAY_PAUSE_AFTER_INTERACTION)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller || event.pointerType === 'touch') return

    dragDistanceRef.current = 0
    pointerStartXRef.current = event.clientX
    pointerStartScrollLeftRef.current = scroller.scrollLeft
    setIsDragging(true)
    setIsPaused(true)
    scroller.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller || !isDragging) return

    const deltaX = event.clientX - pointerStartXRef.current
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(deltaX))
    scroller.scrollLeft = pointerStartScrollLeftRef.current - deltaX
    wrapScrollPosition(scroller)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller) return

    setIsDragging(false)
    scroller.releasePointerCapture(event.pointerId)
    wrapScrollPosition(scroller)

    if (interactionTimeoutRef.current) {
      window.clearTimeout(interactionTimeoutRef.current)
    }

    interactionTimeoutRef.current = window.setTimeout(() => {
      setIsPaused(false)
    }, AUTOPLAY_PAUSE_AFTER_INTERACTION)
  }

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragDistanceRef.current > 6) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-dark-border/70 bg-gradient-to-br from-dark-surface/80 to-dark-bg/90 shadow-2xl shadow-primary-blue/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.1),_transparent_30%)]" />

      <div className="relative z-10 flex items-center justify-between gap-4 px-5 pt-5 md:px-6 md:pt-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-blue mb-2">Community Feed</p>
          <p className="text-sm text-text-tertiary">Auto-scrolls and loops through the latest 5 community updates.</p>
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

      <div className="relative z-10 px-5 pb-5 pt-5 md:px-6 md:pb-6">
        <div
          ref={scrollerRef}
          className={`no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClickCapture={handleClickCapture}
          style={{ touchAction: 'pan-y' }}
        >
          {loopedPosts.map((post, index) => {
            const isOriginal = index >= posts.length && index < posts.length * 2

            return (
              <Card
                key={`${post.id}-${index}`}
                variant="interactive"
                padding="none"
                className="group/card flex-shrink-0 overflow-hidden border border-dark-border/70 bg-dark-surface/95 shadow-xl shadow-black/10 w-[calc(100vw-2.5rem)] md:w-[calc(50vw-3.25rem)] lg:w-[calc(50vw-4rem)] xl:w-[calc(50%-0.75rem)]"
                data-carousel-card="true"
                aria-hidden={!isOriginal}
              >
                <div className="flex h-full flex-col">
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5">
                    {post.thumbnail_image?.public_url ? (
                      <Image
                        src={post.thumbnail_image.public_url}
                        alt={post.thumbnail_image.alt_text || post.title}
                        fill
                        quality={95}
                        className="object-cover transition-transform duration-700 group-hover/card:scale-[1.03]"
                        loading={index < posts.length ? 'eager' : 'lazy'}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Newspaper className="h-12 w-12 text-primary-blue/80" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/70 via-transparent to-transparent opacity-60" />
                    <div className="absolute left-4 top-4">
                      <Badge variant="tech" size="sm" className="bg-dark-bg/70 backdrop-blur-md border border-white/10 text-white">
                        Community Activities
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="flex flex-1 flex-col p-5 md:p-6">
                    <h3 className="mb-2 line-clamp-2 text-xl font-bold leading-tight text-text-primary group-hover/card:text-primary-blue transition-colors">
                      {post.title || 'Untitled Post'}
                    </h3>

                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                      {post.summary || 'No summary available'}
                    </p>

                    <div className="mt-auto flex items-center gap-4 text-xs text-text-tertiary">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.reading_time} min read</span>
                      </div>
                    </div>

                    <Button asChild variant="secondary" size="sm" className="mt-5 w-full group/btn">
                      <Link href={`/posts/${post.slug}`}>
                        View Detail
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 text-xs text-text-tertiary">
          <span>Hover to pause. Use arrows to browse manually.</span>
          <span>{isPaused ? 'Paused' : 'Playing'}</span>
        </div>
      </div>
    </div>
  )
}