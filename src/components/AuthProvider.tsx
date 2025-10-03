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
    let profileRequestInProgress = false

    // Helper function to fetch profile safely
    const fetchProfile = async (userId: string, setLoadingState = true) => {
      if (profileRequestInProgress) return null

      profileRequestInProgress = true
      if (setLoadingState) setProfileLoading(true)

      try {
        const userProfile = await auth.getProfile(userId)
        if (isMounted) {
          if (userProfile) {
            setProfile(userProfile)
          } else {
            setProfile(null)
          }
        }
        return userProfile
      } catch (error) {
        console.error('Error loading profile:', error)
        if (isMounted) setProfile(null)
        return null
      } finally {
        profileRequestInProgress = false
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

          // Fetch profile with timeout
          try {
            await Promise.race([
              fetchProfile(session.user.id),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
              )
            ])
          } catch (profileError) {
            console.error('AuthProvider: Profile fetch failed:', profileError)
            // Continue anyway, just without profile data
            setProfile(null)
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

            // Fetch profile with timeout
            try {
              await Promise.race([
                fetchProfile(session.user.id, false),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
                )
              ])
            } catch (profileError) {
              console.error('AuthProvider: Profile fetch failed on auth change:', profileError)
              setProfile(null)
            }
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