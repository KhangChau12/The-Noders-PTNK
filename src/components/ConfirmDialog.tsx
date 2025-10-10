'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return context
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)

    return new Promise((resolve) => {
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true)
    }
    setIsOpen(false)
    setOptions(null)
    setResolvePromise(null)
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false)
    }
    setIsOpen(false)
    setOptions(null)
    setResolvePromise(null)
  }, [resolvePromise])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <ConfirmDialog
          options={options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  )
}

function ConfirmDialog({
  options,
  onConfirm,
  onCancel
}: {
  options: ConfirmOptions
  onConfirm: () => void
  onCancel: () => void
}) {
  const {
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning'
  } = options

  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-error',
      iconBg: 'bg-error/10',
      buttonVariant: 'danger' as const
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10',
      buttonVariant: 'primary' as const
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-info',
      iconBg: 'bg-info/10',
      buttonVariant: 'primary' as const
    }
  }

  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            'pointer-events-auto w-full max-w-md bg-dark-surface rounded-lg shadow-xl border border-dark-border',
            'animate-slide-up'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className={cn('p-2 rounded-lg', config.iconBg)}>
                <Icon className={cn('w-6 h-6', config.iconColor)} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary">
                  {title}
                </h3>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-6">
            <p className="text-text-secondary text-sm leading-relaxed ml-14">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-dark-bg/50 rounded-b-lg border-t border-dark-border">
            <Button
              variant="secondary"
              size="sm"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <Button
              variant={config.buttonVariant}
              size="sm"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
