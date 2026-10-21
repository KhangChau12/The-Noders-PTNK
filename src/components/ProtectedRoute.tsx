'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { LoadBar } from './Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallback
}: ProtectedRouteProps) {
  const { user, profile, loading, profileLoading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Member pages render as soon as the session is known. Admin pages also
  // need the profile, because that's where the role lives.
  const waitingForRole = requireAdmin && !!user && !profile && !!profileLoading

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?next=${encodeURIComponent(pathname || '/dashboard')}`)
    } else if (!loading && user && requireAdmin && !waitingForRole && !isAdmin) {
      router.push('/dashboard')
    }
  }, [user, loading, requireAdmin, waitingForRole, isAdmin, router, pathname])

  if (loading || waitingForRole) {
    return fallback || (
      <div aria-busy="true" className="min-h-[60vh]">
        <LoadBar />
        <span className="sr-only" role="status">Loading</span>
      </div>
    )
  }

  if (!user) {
    return fallback || null
  }

  if (requireAdmin && !isAdmin) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Access Denied
          </h2>
          <p className="text-text-secondary">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
