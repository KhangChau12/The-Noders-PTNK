'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { AdminData, EMPTY_ADMIN, fetchAdminData } from '@/lib/admin'

interface AdminContextValue {
  data: AdminData
  ready: boolean
  refresh: () => Promise<void>
  /** Optimistic local edit; call refresh() after the server confirms if needed. */
  patch: (fn: (d: AdminData) => AdminData) => void
  /** fetch() with the admin's bearer token and JSON body. */
  api: (path: string, init?: { method?: string; body?: unknown }) => Promise<any>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [data, setData] = useState<AdminData>(EMPTY_ADMIN)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setData(await fetchAdminData())
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    if (session?.access_token) refresh()
  }, [session?.access_token, refresh])

  const patch = useCallback((fn: (d: AdminData) => AdminData) => setData((d) => fn(d)), [])

  const api = useCallback(
    async (path: string, init?: { method?: string; body?: unknown }) => {
      const res = await fetch(path, {
        method: init?.method || 'GET',
        headers: { Authorization: `Bearer ${session?.access_token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
        body: init?.body ? JSON.stringify(init.body) : undefined,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.success === false) throw new Error(json.error || `Request failed (${res.status})`)
      return json
    },
    [session?.access_token]
  )

  return <AdminContext.Provider value={{ data, ready, refresh, patch, api }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider')
  return ctx
}
