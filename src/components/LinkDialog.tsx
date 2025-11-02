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
          className="bg-dark-surface border border-dark-border rounded-xl shadow-2xl shadow-primary-blue/10 max-w-md w-full pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-primary-blue" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Insert Link</h3>
                {selectedText && (
                  <p className="text-sm text-text-tertiary mt-0.5 line-clamp-1">
                    Linking: "{selectedText}"
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-dark-border/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label htmlFor="url-input" className="block text-sm font-medium text-text-secondary mb-2">
                URL
              </label>
              <div className="relative">
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
                  className={`w-full px-4 py-3 bg-dark-bg border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 transition-all ${
                    error
                      ? 'border-error focus:ring-error/20'
                      : 'border-dark-border focus:border-primary-blue focus:ring-primary-blue/20'
                  }`}
                />
                <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
              </div>
              {error && (
                <p className="text-error text-sm mt-2 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>

            {/* Quick links suggestion */}
            <div className="mb-6">
              <p className="text-xs text-text-tertiary mb-2">Quick examples:</p>
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
                    className="text-xs px-2 py-1 bg-dark-border/50 hover:bg-primary-blue/20 border border-dark-border hover:border-primary-blue/50 rounded text-text-tertiary hover:text-primary-blue transition-all"
                  >
                    {example === 'https://' ? 'Clear' : example}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary-blue to-accent-cyan hover:from-primary-blue/90 hover:to-accent-cyan/90"
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
