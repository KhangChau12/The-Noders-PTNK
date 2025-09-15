'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PlaceholderImageProps {
  src?: string | null
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  text?: string
  bgColor?: string
  textColor?: string
  fallbackText?: string
}

function generatePlaceholderSVG({
  width = 400,
  height = 300,
  text = 'No Image',
  bgColor = '#334155',
  textColor = '#CBD5E1'
}: {
  width?: number
  height?: number
  text?: string
  bgColor?: string
  textColor?: string
}) {
  const fontSize = Math.min(width, height) / 8
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="system-ui, -apple-system, sans-serif"
            font-size="${fontSize}" fill="${textColor}" opacity="0.8">
        ${text}
      </text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export function PlaceholderImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  fill = false,
  text = 'No Image',
  bgColor = '#334155',
  textColor = '#CBD5E1',
  fallbackText
}: PlaceholderImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const placeholderSrc = generatePlaceholderSVG({
    width: fill ? 400 : width,
    height: fill ? 300 : height,
    text: imageError && fallbackText ? fallbackText : text,
    bgColor,
    textColor
  })

  const shouldShowPlaceholder = !src || imageError || imageLoading

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
            style={{
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}
          />
        ) : null}

        {shouldShowPlaceholder && (
          <Image
            src={placeholderSrc}
            alt={alt}
            fill
            className="object-cover"
            style={{
              opacity: imageLoading || imageError || !src ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="object-cover w-full h-full"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
          style={{
            opacity: imageLoading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
        />
      ) : null}

      {shouldShowPlaceholder && (
        <Image
          src={placeholderSrc}
          alt={alt}
          width={width}
          height={height}
          className="object-cover w-full h-full absolute inset-0"
          style={{
            opacity: imageLoading || imageError || !src ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  )
}

export function generateAvatarPlaceholder(name?: string): string {
  if (!name) {
    return generatePlaceholderSVG({
      width: 150,
      height: 150,
      text: '?',
      bgColor: '#334155',
      textColor: '#CBD5E1'
    })
  }

  const initials = name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)

  return generatePlaceholderSVG({
    width: 150,
    height: 150,
    text: initials,
    bgColor: '#2563EB',
    textColor: '#ffffff'
  })
}