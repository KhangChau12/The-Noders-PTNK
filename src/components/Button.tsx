'use client'

import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, asChild, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      primary: 'bg-gradient-to-r from-primary-blue to-accent-blue text-white hover:from-accent-blue hover:to-primary-blue hover:shadow-lg hover:shadow-primary-blue/30',
      secondary: 'bg-dark-surface text-text-primary border border-dark-border hover:bg-dark-border hover:border-primary-blue/30',
      ghost: 'text-text-secondary hover:bg-dark-surface hover:text-text-primary',
      danger: 'bg-gradient-to-r from-error to-red-700 text-white hover:from-red-700 hover:to-error hover:shadow-lg hover:shadow-error/30',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm rounded-md',
      md: 'h-10 px-4 py-2 rounded-md',
      lg: 'h-11 px-8 rounded-md',
    }

    const buttonClasses = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      className
    )

    if (asChild) {
      // When asChild is true, we apply the styles to the child element
      // and don't render our own button
      const child = children as React.ReactElement
      if (child && child.type) {
        return React.cloneElement(child, {
          className: cn(buttonClasses, child.props.className),
          ...props
        })
      }
    }

    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }