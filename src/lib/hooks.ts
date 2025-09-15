'use client'

import { useState, useEffect } from 'react'
import { createClient } from './supabase'
import { auth } from './auth'
import { projectQueries, memberQueries } from './queries'
import { AuthUser, AuthSession } from '@/types/auth'
import { Profile, ProjectWithContributors, ProfileWithProjects } from '@/types/database'
import { ProjectFilters, MemberFilters } from '@/types/project'

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user as AuthUser)
        setSession(session as AuthSession)
        
        // Get user profile
        const profile = await auth.getProfile(session.user.id)
        setProfile(profile)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user as AuthUser)
          setSession(session as AuthSession)
          
          const profile = await auth.getProfile(session.user.id)
          setProfile(profile)
        } else {
          setUser(null)
          setSession(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    return await auth.signIn(email, password)
  }

  const signOut = async () => {
    await auth.signOut()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' }
    
    const result = await auth.updateProfile(user.id, updates)
    if (result.profile) {
      setProfile(result.profile)
    }
    return result
  }

  const isAdmin = profile?.role === 'admin'

  return {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    updateProfile,
    isAdmin,
  }
}

// Projects hook
export function useProjects(filters: ProjectFilters = {}) {
  const [projects, setProjects] = useState<ProjectWithContributors[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      const { projects, error } = await projectQueries.getProjects(filters)
      
      if (error) {
        setError(error.message)
      } else {
        setProjects(projects || [])
        setError(null)
      }
      
      setLoading(false)
    }

    fetchProjects()
  }, [filters])

  const refetch = async () => {
    const { projects, error } = await projectQueries.getProjects(filters)
    if (error) {
      setError(error.message)
    } else {
      setProjects(projects || [])
      setError(null)
    }
  }

  return { projects, loading, error, refetch }
}

// Single project hook
export function useProject(id: string) {
  const [project, setProject] = useState<ProjectWithContributors | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return
      
      setLoading(true)
      const { project, error } = await projectQueries.getProject(id)
      
      if (error) {
        setError(error.message)
      } else {
        setProject(project)
        setError(null)
      }
      
      setLoading(false)
    }

    fetchProject()
  }, [id])

  return { project, loading, error }
}

// Members hook
export function useMembers(filters: MemberFilters = {}) {
  const [members, setMembers] = useState<ProfileWithProjects[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      const { members, error } = await memberQueries.getMembers(filters)
      
      if (error) {
        setError(error.message)
      } else {
        setMembers(members || [])
        setError(null)
      }
      
      setLoading(false)
    }

    fetchMembers()
  }, [filters])

  const refetch = async () => {
    const { members, error } = await memberQueries.getMembers(filters)
    if (error) {
      setError(error.message)
    } else {
      setMembers(members || [])
      setError(null)
    }
  }

  return { members, loading, error, refetch }
}

// Single member hook
export function useMember(username: string) {
  const [member, setMember] = useState<ProfileWithProjects | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMember = async () => {
      if (!username) return
      
      setLoading(true)
      const { member, error } = await memberQueries.getMember(username)
      
      if (error) {
        setError(error.message)
      } else {
        setMember(member)
        setError(null)
      }
      
      setLoading(false)
    }

    fetchMember()
  }, [username])

  return { member, loading, error }
}

// Generic loading hook
export function useLoading(initialState: boolean = false) {
  const [loading, setLoading] = useState(initialState)
  
  return {
    loading,
    setLoading,
    withLoading: async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      setLoading(true)
      try {
        const result = await asyncFn()
        return result
      } finally {
        setLoading(false)
      }
    }
  }
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}