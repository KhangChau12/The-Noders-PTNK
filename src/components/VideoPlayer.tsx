'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

function idFrom(url: string) {
  const m = url.match(/(?:v=|embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

export function VideoPlayer({ url, title, className, label }: { url: string; title: string; className?: string; label?: string }) {
  const [playing, setPlaying] = useState(false)
  const id = idFrom(url)
  if (!id) return null

  return (
    <div className={cn('relative aspect-video overflow-hidden rounded-xl bg-paper', className)}>
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play: ${title}`}>
          <Image src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" />
          {label ? (
            <span className="absolute bottom-5 left-5 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-2.5 pr-[18px] text-[15px] font-semibold text-navy-dark">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-white"><path d="M8 5v14l11-7z" /></svg>
              </span>
              {label}
            </span>
          ) : (
            <span className="absolute inset-0 m-auto flex h-[68px] w-[68px] items-center justify-center rounded-full bg-white transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-navy-dark"><path d="M8 5v14l11-7z" /></svg>
            </span>
          )}
        </button>
      )}
    </div>
  )
}
