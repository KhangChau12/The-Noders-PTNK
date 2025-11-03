'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/Button'
import { Link as LinkIcon, ExternalLink, X, Check } from 'lucide-react'

interface LinkDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (url: string) => void
  selectedText?: string
}

export function LinkDialog({ isOpen, onClose, onSubmit, selectedText }: LinkDialogProps) {
  const [url, setUrl] = useState('https://')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setUrl('https://')
      setError('')
      // Focus input after modal animation
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [isOpen])

  const validateUrl = (urlString: string): boolean => {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url || url === 'https://') {
      setError('Please enter a URL')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    onSubmit(url)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-dark-surface border border-primary-blue/20 rounded-2xl shadow-2xl shadow-primary-blue/20 max-w-lg w-full pointer-events-auto animate-scale-in relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient overlay at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-blue via-accent-cyan to-primary-blue" />

          {/* Subtle glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-primary-blue/10 to-transparent blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border/50 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-blue/30 to-accent-cyan/30 rounded-xl flex items-center justify-center border border-primary-blue/30 shadow-lg shadow-primary-blue/20 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/20 to-transparent rounded-xl" />
                <LinkIcon className="w-6 h-6 text-primary-blue relative z-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Insert Link</h3>
                {selectedText && (
                  <p className="text-sm text-text-secondary mt-1 line-clamp-1 max-w-[300px]">
                    Linking: <span className="text-accent-cyan font-medium">"{selectedText}"</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary transition-all p-2 rounded-lg hover:bg-dark-border/50 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 pt-8 relative">
            <div className="mb-6">
              <label htmlFor="url-input" className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <ExternalLink className="w-4 h-4 text-primary-blue" />
                URL Address
              </label>
              <div className="relative group">
                <input
                  ref={inputRef}
                  id="url-input"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setError('')
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="https://example.com"
                  className={`w-full px-4 py-3.5 bg-dark-bg/50 border-2 rounded-xl text-text-primary placeholder-text-tertiary/60 focus:outline-none focus:ring-4 transition-all font-mono text-sm ${
                    error
                      ? 'border-error/50 focus:border-error focus:ring-error/10 bg-error/5'
                      : 'border-dark-border/50 focus:border-primary-blue focus:ring-primary-blue/10 group-hover:border-primary-blue/30'
                  }`}
                />
                {!error && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-accent-cyan/50 animate-pulse" />
                  </div>
                )}
              </div>
              {error && (
                <div className="mt-3 p-3 bg-error/10 border border-error/30 rounded-lg">
                  <p className="text-error text-sm flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3" />
                    </div>
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Quick links suggestion */}
            <div className="mb-8">
              <p className="text-xs font-medium text-text-secondary mb-3 uppercase tracking-wider">Quick Templates</p>
              <div className="flex flex-wrap gap-2">
                {['https://github.com/', 'https://docs.example.com/', 'https://'].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setUrl(example)
                      setError('')
                      inputRef.current?.focus()
                    }}
                    className={`text-xs px-3 py-2 rounded-lg font-mono border-2 transition-all duration-200 ${
                      example === 'https://'
                        ? 'bg-dark-border/30 border-dark-border hover:border-accent-cyan/50 hover:bg-accent-cyan/10 text-text-secondary hover:text-accent-cyan'
                        : 'bg-primary-blue/5 border-primary-blue/20 hover:border-primary-blue/50 hover:bg-primary-blue/10 text-text-secondary hover:text-primary-blue'
                    } hover:scale-105 hover:shadow-lg`}
                  >
                    {example === 'https://' ? '✕ Clear' : example}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-dark-border/30">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="hover:bg-dark-border/30"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary-blue to-accent-cyan hover:from-primary-blue/90 hover:to-accent-cyan/90 shadow-lg shadow-primary-blue/30 hover:shadow-xl hover:shadow-primary-blue/40 hover:scale-105 transition-all duration-200"
              >
                <Check className="w-4 h-4 mr-2" />
                Insert Link
              </Button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
