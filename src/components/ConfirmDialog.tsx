'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
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
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider')
  return context
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = useCallback((result: boolean) => {
    resolver.current?.(result)
    resolver.current = null
    setOptions(null)
  }, [])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && <ConfirmDialog options={options} onClose={close} />}
    </ConfirmContext.Provider>
  )
}

/**
 * Only for things that can't be undone. The safe choice has focus, Esc cancels,
 * and the confirm button repeats the verb.
 */
function ConfirmDialog({ options, onClose }: { options: ConfirmOptions; onClose: (result: boolean) => void }) {
  const { title = 'Are you sure?', message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'warning' } = options
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-[rgba(5,8,14,0.6)]" onClick={() => onClose(false)} />
      <div className="pointer-events-none fixed inset-0 z-[71] flex items-end justify-center sm:items-center sm:p-4">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-body"
          className="dialog-pop pointer-events-auto w-full max-w-[440px] rounded-t-[16px] border border-[#2A2E37] bg-paper px-[26px] pb-[max(22px,env(safe-area-inset-bottom))] pt-[26px] sm:rounded-[14px] sm:pb-[22px] shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
        >
          <h2 id="confirm-title" className="mb-2 text-xl font-bold">{title}</h2>
          <p id="confirm-body" className="mb-[22px] text-[15px] text-text-secondary">{message}</p>
          <div className="flex justify-end gap-2.5">
            <button
              ref={cancelRef}
              type="button"
              onClick={() => onClose(false)}
              className="min-h-[42px] rounded-md border border-control px-4 font-semibold text-text-primary hover:border-text-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => onClose(true)}
              className={cn(
                'min-h-[42px] rounded-md px-4 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link',
                variant === 'danger' ? 'bg-[#C2412D] text-white hover:bg-[#D14C37]' : 'bg-text-primary text-ink hover:bg-white'
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
