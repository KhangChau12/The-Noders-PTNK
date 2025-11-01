'use client'

import { ReactNode } from 'react'
import { Check, AlertCircle, Circle } from 'lucide-react'

export type Language = 'en' | 'vi'

export type ValidationStatus = 'valid' | 'empty' | 'error'

interface LanguageTabsProps {
  activeLanguage: Language
  onLanguageChange: (lang: Language) => void
  enStatus: ValidationStatus
  viStatus: ValidationStatus
  className?: string
}

const StatusIcon = ({ status }: { status: ValidationStatus }) => {
  switch (status) {
    case 'valid':
      return <Check className="w-4 h-4" strokeWidth={2.5} />
    case 'error':
      return <AlertCircle className="w-4 h-4" strokeWidth={2.5} />
    case 'empty':
      return <Circle className="w-2.5 h-2.5 fill-current" />
  }
}

const getStatusColor = (status: ValidationStatus, isActive: boolean) => {
  if (isActive) {
    switch (status) {
      case 'valid':
        return 'text-success'
      case 'error':
        return 'text-error'
      case 'empty':
        return 'text-text-tertiary/50'
    }
  }

  switch (status) {
    case 'valid':
      return 'text-success/60'
    case 'error':
      return 'text-error/60'
    case 'empty':
      return 'text-text-tertiary/40'
  }
}

export function LanguageTabs({
  activeLanguage,
  onLanguageChange,
  enStatus,
  viStatus,
  className = ''
}: LanguageTabsProps) {
  const isEnActive = activeLanguage === 'en'
  const isViActive = activeLanguage === 'vi'

  return (
    <div className={`flex gap-1 ${className}`} data-active-tab={activeLanguage}>
      {/* EN Tab */}
      <button
        type="button"
        onClick={() => onLanguageChange('en')}
        className={`
          group relative px-5 py-2.5 text-sm font-semibold
          flex items-center gap-2.5 transition-all duration-200 ease-out
          border-t-2 border-x-2
          ${
            isEnActive
              ? 'rounded-t-lg bg-dark-surface text-text-primary border-primary-blue translate-y-0 border-b-transparent z-10'
              : 'rounded-t-lg rounded-br-lg bg-dark-bg/40 text-text-secondary border-transparent hover:bg-dark-bg/60 hover:text-text-primary hover:border-dark-border translate-y-1 border-b-dark-border z-0'
          }
        `}
      >
        {/* Subtle glow for active tab */}
        {isEnActive && (
          <div className="absolute inset-0 rounded-t-lg bg-primary-blue/5" />
        )}

        <span className="relative z-10 tracking-wide">EN</span>
        <span className={`relative z-10 transition-all duration-200 ${getStatusColor(enStatus, isEnActive)}`}>
          <StatusIcon status={enStatus} />
        </span>
      </button>

      {/* VI Tab */}
      <button
        type="button"
        onClick={() => onLanguageChange('vi')}
        className={`
          group relative px-5 py-2.5 text-sm font-semibold
          flex items-center gap-2.5 transition-all duration-200 ease-out
          border-t-2 border-x-2
          ${
            isViActive
              ? 'rounded-t-lg bg-dark-surface text-text-primary border-primary-blue translate-y-0 border-b-transparent z-10'
              : 'rounded-t-lg rounded-bl-lg bg-dark-bg/40 text-text-secondary border-transparent hover:bg-dark-bg/60 hover:text-text-primary hover:border-dark-border translate-y-1 border-b-dark-border z-0'
          }
        `}
      >
        {/* Subtle glow for active tab */}
        {isViActive && (
          <div className="absolute inset-0 rounded-t-lg bg-primary-blue/5" />
        )}

        <span className="relative z-10 tracking-wide">VI</span>
        <span className={`relative z-10 transition-all duration-200 ${getStatusColor(viStatus, isViActive)}`}>
          <StatusIcon status={viStatus} />
        </span>
      </button>
    </div>
  )
}

interface LanguageTabPanelProps {
  language: Language
  activeLanguage: Language
  children: ReactNode
}

export function LanguageTabPanel({
  language,
  activeLanguage,
  children
}: LanguageTabPanelProps) {
  if (language !== activeLanguage) return null

  // When EN is active: round top-right corner (VI tab side)
  // When VI is active: round top-left AND top-right corners (EN tab side + right edge)
  const topCornerClass = activeLanguage === 'en' ? 'rounded-tr-lg' : 'rounded-t-lg'

  return (
    <div className={`relative bg-dark-surface border-2 border-primary-blue rounded-b-lg ${topCornerClass} overflow-hidden p-5 -mt-0.5 z-[5] animate-in fade-in duration-200`}>
      {children}
    </div>
  )
}
