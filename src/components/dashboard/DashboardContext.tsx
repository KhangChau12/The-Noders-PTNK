'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { DashboardData, EMPTY_DASHBOARD, fetchDashboardData } from '@/lib/dashboard'

/** Unsaved profile edits, shown live in the identity band while editing. */
export interface ProfilePreview {
  full_name: string
  bio: string
  avatar_url: string | null
}

interface DashboardContextValue {
  data: DashboardData
  ready: boolean
  refresh: () => Promise<void>
  preview: ProfilePreview | null
  setPreview: (p: ProfilePreview | null) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD)
  const [ready, setReady] = useState(false)
  const [preview, setPreview] = useState<ProfilePreview | null>(null)

  const refresh = useCallback(async () => {
    if (!user?.id) return
    try {
      setData(await fetchDashboardData(user.id))
    } finally {
      setReady(true)
    }
  }, [user?.id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <DashboardContext.Provider value={{ data, ready, refresh, preview, setPreview }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider')
  return ctx
}
