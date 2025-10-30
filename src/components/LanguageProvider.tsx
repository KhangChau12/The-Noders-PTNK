'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type Language = 'en' | 'vi'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  localize: (enValue: string | null | undefined, viValue: string | null | undefined) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null
    if (savedLang === 'en' || savedLang === 'vi') {
      setLangState(savedLang)
    }
  }, [])

  // Save language to localStorage when it changes
  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('language', newLang)
  }

  // Helper function to get localized value
  const localize = (enValue: string | null | undefined, viValue: string | null | undefined): string => {
    if (lang === 'vi') {
      return viValue || enValue || ''
    }
    return enValue || ''
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, localize }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
