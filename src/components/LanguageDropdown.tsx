'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from './LanguageProvider'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export function LanguageDropdown() {
  const { lang, setLang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'en' as const, flag: '🇬🇧', label: 'English' },
    { code: 'vi' as const, flag: '🇻🇳', label: 'Tiếng Việt' }
  ]

  const currentLanguage = languages.find(l => l.code === lang) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (code: 'en' | 'vi') => {
    setLang(code)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-lg',
          'bg-dark-surface border border-dark-border',
          'hover:bg-dark-bg/50 transition-all',
          'text-sm font-medium text-text-primary',
          isOpen && 'ring-2 ring-primary-blue/50'
        )}
      >
        <span>{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleSelect(language.code)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5',
                'hover:bg-dark-bg/50 transition-colors',
                'text-sm font-medium',
                lang === language.code
                  ? 'text-primary-blue bg-primary-blue/10'
                  : 'text-text-primary'
              )}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="flex-1 text-left">{language.label}</span>
              {lang === language.code && (
                <span className="text-primary-blue">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
