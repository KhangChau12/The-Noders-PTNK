import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'tech'
  size?: 'sm' | 'md'
}

function Badge({ className, variant = 'default', size = 'sm', ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  
  const variants = {
    default: 'bg-dark-border text-text-primary',
    primary: 'bg-primary-blue text-white',
    secondary: 'bg-accent-gray/20 text-accent-gray',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    error: 'bg-error/20 text-error',
    tech: 'bg-accent-cyan/20 text-accent-cyan font-mono',
  }
  
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs rounded-full',
    md: 'px-3 py-1 text-sm rounded-full',
  }

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

export { Badge }