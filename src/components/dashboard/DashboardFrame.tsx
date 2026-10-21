'use client'

import type { ReactNode } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardProvider } from './DashboardContext'
import { DashboardShell } from './DashboardShell'

/** Auth gate, shared data and the identity band for every /dashboard page. */
export function DashboardFrame({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardProvider>
    </ProtectedRoute>
  )
}
