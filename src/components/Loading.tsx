'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  className?: string
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Loading({ className, text = 'Loading...', size = 'md' }: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin text-primary-blue', sizes[size])} />
      {text && <span className="text-text-secondary">{text}</span>}
    </div>
  )
}

// Skeleton loading components
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-dark-border',
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonProject() {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex space-x-2 mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
      <div className="flex gap-5">
        {/* Left column: avatar + name */}
        <div className="flex flex-col items-center flex-shrink-0 w-32">
          <Skeleton className="w-28 h-28 rounded-full mb-3" />
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-3 w-14" />
        </div>

        {/* Right column: stats */}
        <div className="flex-1 flex flex-col justify-between">
          <Skeleton className="h-3 w-40 mb-3" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
    </div>
  )
}