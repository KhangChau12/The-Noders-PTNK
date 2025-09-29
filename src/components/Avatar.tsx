'use client'

import { cn } from '@/lib/utils'

interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-20 h-20 text-lg'
}

export function Avatar({
  name,
  src,
  size = 'md',
  className,
  showBorder = false
}: AvatarProps) {
  const getInitials = (fullName: string | null) => {
    if (!fullName) return '?'
    return fullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const getBackgroundColor = (fullName: string | null) => {
    if (!fullName) return 'bg-slate-500'

    // Generate consistent color based on name
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-teal-500'
    ]

    const nameHash = fullName.split('').reduce((hash, char) => {
      return char.charCodeAt(0) + ((hash << 5) - hash)
    }, 0)

    return colors[Math.abs(nameHash) % colors.length]
  }

  const initials = getInitials(name)
  const bgColor = getBackgroundColor(name)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-medium text-white relative overflow-hidden',
        'transition-all duration-200 hover:scale-105',
        !src && bgColor,
        sizeClasses[size],
        showBorder && 'ring-2 ring-white ring-offset-2',
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        initials
      )}
    </div>
  )
}