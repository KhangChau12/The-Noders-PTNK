'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Toast types matching the website's semantic colors
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (type: ToastType, message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Toast Provider Component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string, duration: number = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = { id, type, message, duration }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container - renders all toasts
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

// Individual Toast Item
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-dark-surface',
      borderColor: 'border-success',
      iconColor: 'text-success',
      textColor: 'text-text-primary'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-dark-surface',
      borderColor: 'border-error',
      iconColor: 'text-error',
      textColor: 'text-text-primary'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-dark-surface',
      borderColor: 'border-warning',
      iconColor: 'text-warning',
      textColor: 'text-text-primary'
    },
    info: {
      icon: Info,
      bgColor: 'bg-dark-surface',
      borderColor: 'border-info',
      iconColor: 'text-info',
      textColor: 'text-text-primary'
    }
  }

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[toast.type]

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 min-w-[320px] max-w-md p-4 rounded-lg border-l-4 shadow-lg',
        'backdrop-blur-sm animate-slide-in-right',
        bgColor,
        borderColor
      )}
      style={{
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)} />

      <p className={cn('flex-1 text-sm font-medium', textColor)}>
        {toast.message}
      </p>

      <button
        onClick={onRemove}
        className="flex-shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Convenience helper functions
export const toast = {
  success: (message: string, duration?: number) => {
    // This will be replaced by the hook version
    console.log('[Toast] Success:', message)
  },
  error: (message: string, duration?: number) => {
    console.log('[Toast] Error:', message)
  },
  warning: (message: string, duration?: number) => {
    console.log('[Toast] Warning:', message)
  },
  info: (message: string, duration?: number) => {
    console.log('[Toast] Info:', message)
  }
}
