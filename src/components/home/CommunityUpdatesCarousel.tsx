'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Calendar, Clock, ChevronLeft, ChevronRight, Eye, Newspaper } from 'lucide-react'

type CommunityPost = {
  id: string
  title: string
  summary: string
  slug: string
  category: string
  reading_time: number
  view_count?: number
  published_at: string
  thumbnail_image?: {
    public_url?: string
    alt_text?: string | null
  }
}

interface CommunityUpdatesCarouselProps {
  posts: CommunityPost[]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CommunityUpdatesCarousel({ posts }: CommunityUpdatesCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const pointerStartXRef = useRef(0)
  const dragDistanceRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

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
        const firstCard = scroller.querySelector<HTMLElement>('[data-carousel-card]')
        const scrollerStyle = window.getComputedStyle(scroller)
        const gap = parseFloat(scrollerStyle.columnGap || scrollerStyle.gap || '0') || 0
        const firstCardWidth = firstCard?.getBoundingClientRect().width || 0
        const cardStep = firstCardWidth + gap

        // Keep mobile layout aligned, and offset by half card on wider layouts.
        const shouldOffsetHalfCard = firstCardWidth > 0 && firstCardWidth <= scroller.clientWidth * 0.75
        const initialOffset = shouldOffsetHalfCard ? cardStep / 2 : 0

        scroller.scrollLeft = segmentWidth + initialOffset
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
    const scrollerStyle = window.getComputedStyle(scroller)
    const gap = parseFloat(scrollerStyle.columnGap || scrollerStyle.gap || '0') || 0
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : scroller.clientWidth

    scroller.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller) return

    dragDistanceRef.current = 0
    pointerStartXRef.current = event.clientX
    setIsDragging(true)
    scroller.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller || !isDragging) return

    const deltaX = event.clientX - pointerStartXRef.current
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(deltaX))
    scroller.scrollLeft -= deltaX
    wrapScrollPosition(scroller)

    // Re-anchor pointer delta after each move to avoid jump when wrapping at segment edges.
    pointerStartXRef.current = event.clientX
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller) return

    setIsDragging(false)
    scroller.releasePointerCapture(event.pointerId)
    wrapScrollPosition(scroller)
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
    <div>
      {/* Carousel with arrows flanking the left/right edges (hidden on touch) */}
      <div className="relative">
        {/* Left arrow — sits just inside the left edge, overlapping the strip */}
        <button
          type="button"
          aria-label="Previous posts"
          onClick={() => nudge('prev')}
          className="absolute -left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-dark-border bg-dark-surface/90 p-2.5 text-text-secondary shadow-lg backdrop-blur-md transition-all duration-300 hover:border-primary-blue/60 hover:text-primary-blue lg:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Right arrow */}
        <button
          type="button"
          aria-label="Next posts"
          onClick={() => nudge('next')}
          className="absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-dark-border bg-dark-surface/90 p-2.5 text-text-secondary shadow-lg backdrop-blur-md transition-all duration-300 hover:border-primary-blue/60 hover:text-primary-blue lg:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

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
          {loopedPosts.map((post, index) => {
            const isOriginal = index >= posts.length && index < posts.length * 2

            return (
              <Card
                key={`${post.id}-${index}`}
                variant="interactive"
                padding="none"
                className="group/card relative flex-shrink-0 overflow-hidden rounded-2xl border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm transition-all duration-300 hover:border-primary-blue/40 hover:shadow-lg hover:shadow-primary-blue/10 sm:hover:-translate-y-1 w-[85%] xs:w-[78%] sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)]"
                data-carousel-card="true"
                aria-hidden={!isOriginal}
              >
                <Link
                  href={`/posts/${post.slug}`}
                  aria-label={`Read post: ${post.title || 'Untitled Post'}`}
                  className="absolute inset-0 z-10"
                  tabIndex={isOriginal ? 0 : -1}
                />
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

                  <CardContent className="flex flex-1 flex-col p-4 sm:p-5 md:p-6">
                    <h3 className="mb-2 line-clamp-2 text-lg sm:text-xl font-bold leading-tight text-text-primary group-hover/card:text-primary-blue transition-colors">
                      {post.title || 'Untitled Post'}
                    </h3>

                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                      {post.summary || 'No summary available'}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-text-tertiary">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.reading_time} min read</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{post.view_count ?? 0} views</span>
                      </div>
                    </div>

                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-text-tertiary sm:text-left">
        Drag, swipe, or use the arrows to browse posts.
      </p>
    </div>
  )
}