'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import { AuthContextType, AuthUser, AuthSession } from '@/types/auth'
import { Profile } from '@/types/database'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true
    let activeProfileRequest: Promise<any> | null = null
    let lastFetchedUserId: string | null = null

    // Helper function to fetch profile safely with proper mutex
    const fetchProfile = async (userId: string, setLoadingState = true) => {
      // Skip if we already have this profile
      if (lastFetchedUserId === userId && profile?.id === userId) {
        return profile
      }

      // If there's already a request in progress for this user, return it
      if (activeProfileRequest && lastFetchedUserId === userId) {
        return activeProfileRequest
      }

      if (setLoadingState) setProfileLoading(true)

      // Create new request with retry logic
      activeProfileRequest = (async () => {
        let retries = 3
        let lastError: any = null

        while (retries > 0) {
          try {
            const userProfile = await auth.getProfile(userId)
            if (isMounted) {
              if (userProfile) {
                setProfile(userProfile)
                lastFetchedUserId = userId
              } else {
                setProfile(null)
              }
            }
            return userProfile
          } catch (error) {
            lastError = error
            retries--
            if (retries > 0) {
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)))
            }
          }
        }

        // All retries failed
        console.error('Error loading profile after retries:', lastError)
        if (isMounted) setProfile(null)
        return null
      })()

      try {
        const result = await activeProfileRequest
        return result
      } finally {
        activeProfileRequest = null
        if (isMounted && setLoadingState) setProfileLoading(false)
      }
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!isMounted) return

        if (error) {
          console.error('AuthProvider: Error getting session:', error)
          // Clear potentially corrupted session data
          await auth.clearAllAuthData()
          setUser(null)
          setSession(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user as AuthUser)
          setSession(session as AuthSession)

          // Fetch profile with longer timeout and retry
          try {
            await Promise.race([
              fetchProfile(session.user.id),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), 30000) // 30s timeout
              )
            ])
          } catch (profileError) {
            console.warn('AuthProvider: Profile fetch timed out, will retry in background')
            // Continue anyway, retry in background
            fetchProfile(session.user.id, false).catch(() => {
              console.error('Background profile fetch also failed')
            })
          }
        } else {
          setUser(null)
          setSession(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('AuthProvider: Error in getInitialSession:', error)
        // Clear corrupted data on any error
        await auth.clearAllAuthData()
        setUser(null)
        setSession(null)
        setProfile(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        console.log('AuthProvider: Auth state changed:', event)

        try {
          if (session?.user) {
            setUser(session.user as AuthUser)
            setSession(session as AuthSession)

            // Fetch profile with timeout, but don't block auth state change
            fetchProfile(session.user.id, false).catch((profileError) => {
              console.warn('AuthProvider: Profile fetch failed on auth change:', profileError)
              // Don't set profile to null, keep existing profile if any
            })
          } else {
            setUser(null)
            setSession(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          setUser(null)
          setSession(null)
          setProfile(null)
        }

        if (isMounted) setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await auth.signIn(email, password)
    return result
  }

  const signOut = async () => {
    try {
      console.log('Starting signOut process...')

      // Clear local state first
      setUser(null)
      setSession(null)
      setProfile(null)

      // Sign out from Supabase
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Supabase signOut error:', error)
      }

      // Clear all auth data
      await auth.clearAllAuthData()

      console.log('SignOut completed, redirecting...')

      // Force page reload to clear any remaining cache
      window.location.href = '/login'
    } catch (error) {
      console.error('Error during signOut:', error)
      // Force clear even if error occurs
      setUser(null)
      setSession(null)
      setProfile(null)

      // Still try to redirect
      window.location.href = '/login'
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' }

    const result = await auth.updateProfile(user.id, updates)
    if (result.profile) {
      setProfile(result.profile)
    }
    return result
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    return await auth.changePassword(currentPassword, newPassword)
  }

  const isAdmin = profile?.role === 'admin'

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    isAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}