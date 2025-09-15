'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ClickableBadgeProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'tech'
  size?: 'sm' | 'md'
  onClick?: () => void
}

function ClickableBadge({
  className,
  variant = 'default',
  size = 'sm',
  onClick,
  children,
  ...props
}: ClickableBadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer border-none bg-transparent'

  const variants = {
    default: 'bg-dark-border text-text-primary hover:bg-dark-border/80',
    primary: 'bg-primary-blue text-white hover:bg-accent-blue',
    secondary: 'bg-accent-gray/20 text-accent-gray hover:bg-accent-gray/30',
    success: 'bg-success/20 text-success hover:bg-success/30',
    warning: 'bg-warning/20 text-warning hover:bg-warning/30',
    error: 'bg-error/20 text-error hover:bg-error/30',
    tech: 'bg-accent-cyan/20 text-accent-cyan font-mono hover:bg-accent-cyan/30',
  }

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs rounded-full',
    md: 'px-3 py-1 text-sm rounded-full',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export { ClickableBadge }