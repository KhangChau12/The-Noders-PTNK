import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DashboardFrame } from '@/components/dashboard/DashboardFrame'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardFrame>{children}</DashboardFrame>
}
