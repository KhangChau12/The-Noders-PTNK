'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import { Button } from './Button'
import { NAVIGATION_ITEMS, SITE_CONFIG } from '@/lib/constants'
import { Menu, X, User, LogOut, Settings, Shield, Languages } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, signOut, isAdmin } = useAuth()
  const { lang, setLang } = useLanguage()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="font-[family-name:var(--font-shrikhand)] text-text-primary text-2xl">
                The Noders <span className="text-primary-blue">PTNK</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Absolutely Centered */}
          <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-8">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary-blue',
                      isActive ? 'text-primary-blue' : 'text-text-secondary'
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-dark-surface rounded-lg p-1">
              <button
                onClick={() => setLang('en')}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-all',
                  lang === 'en'
                    ? 'bg-primary-blue text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLang('vi')}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-all',
                  lang === 'vi'
                    ? 'bg-primary-blue text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                VI
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" icon={<Shield className="w-4 h-4" />}>
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" icon={<User className="w-4 h-4" />}>
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  icon={<LogOut className="w-4 h-4" />}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-auto p-2"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-border">
            <nav className="flex flex-col space-y-3">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary-blue px-2 py-1',
                      isActive ? 'text-primary-blue' : 'text-text-secondary'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
              
              {/* Mobile Language Toggle */}
              <div className="pt-3 border-t border-dark-border">
                <div className="flex items-center gap-1 bg-dark-surface rounded-lg p-1 mb-3">
                  <button
                    onClick={() => setLang('en')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded text-xs font-medium transition-all',
                      lang === 'en'
                        ? 'bg-primary-blue text-white'
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang('vi')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded text-xs font-medium transition-all',
                      lang === 'vi'
                        ? 'bg-primary-blue text-white'
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    VI
                  </button>
                </div>
              </div>

              {/* Mobile user menu */}
              <div className="pt-3 border-t border-dark-border">
                {user ? (
                  <div className="space-y-2">
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center space-x-2 text-sm font-medium text-text-secondary hover:text-primary-blue px-2 py-1">
                          <Shield className="w-4 h-4" />
                          <span>Admin</span>
                        </div>
                      </Link>
                    )}
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center space-x-2 text-sm font-medium mt-2 text-text-secondary hover:text-primary-blue px-2 py-1">
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </div>
                    </Link>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 text-sm font-medium text-text-secondary hover:text-primary-blue px-2 py-1 w-full justify-start"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <div className="px-2 py-1">
                      <Button size="sm" className="w-full">
                        Sign In
                      </Button>
                    </div>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}