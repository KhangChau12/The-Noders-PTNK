'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastAction {
  label: string
  onClick: () => void
}

interface Toast {
  id: string
  type: ToastType
  message: string
  action?: ToastAction
}

interface ToastContextType {
  toasts: Toast[]
  /** Errors stay until dismissed unless a duration is given; others fade after 4 s. */
  showToast: (type: ToastType, message: string, duration?: number, action?: ToastAction) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const showToast = useCallback(
    (type: ToastType, message: string, duration?: number, action?: ToastAction) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev.slice(-3), { id, type, message, action }])
      const ms = duration ?? (type === 'error' ? 0 : action ? 7000 : 4000)
      if (ms > 0) setTimeout(() => removeToast(id), ms)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[60] flex flex-col items-start gap-2 sm:right-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const MARK: Record<ToastType, { mark: string; tone: string }> = {
  success: { mark: '✓', tone: 'text-[#6FD39F]' },
  info: { mark: 'i', tone: 'text-link' },
  warning: { mark: '!', tone: 'text-signal' },
  error: { mark: '!', tone: 'text-[#FF9C85]' },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const isError = toast.type === 'error'
  const { mark, tone } = MARK[toast.type]
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full max-w-[460px] items-start gap-3 rounded-[10px] border py-3 pl-4 pr-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:w-auto sm:min-w-[320px]',
        'animate-[slideUp_0.2s_ease-out]',
        isError ? 'border-[#6B2A2A] bg-[#2A1714]' : 'border-[#2A2E37] bg-[#1C2027]'
      )}
    >
      <span aria-hidden="true" className={cn('mt-px w-3 shrink-0 text-center font-bold', tone)}>{mark}</span>
      <p className={cn('flex-1 text-[15px]', isError ? 'text-[#FFC9B8]' : 'text-text-primary')}>{toast.message}</p>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action!.onClick()
            onRemove()
          }}
          className="shrink-0 px-2 text-sm font-semibold text-link hover:text-text-primary"
        >
          {toast.action.label}
        </button>
      )}
      <button type="button" onClick={onRemove} aria-label="Dismiss" className={cn('shrink-0 px-1.5 text-lg leading-none', isError ? 'text-[#FFC9B8]' : 'text-text-tertiary hover:text-text-primary')}>
        ×
      </button>
    </div>
  )
}
