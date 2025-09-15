import { createClient, clearSupabaseAuth } from './supabase'
import { AuthUser, AuthSession, CreateMemberData } from '@/types/auth'
import { Profile } from '@/types/database'

// Profile cache to prevent duplicate requests
const profileCache = new Map<string, { profile: Profile | null; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds
const activeRequests = new Map<string, Promise<Profile | null>>()

// Auth utilities
export const auth = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return { error: error.message }
    }
    
    return { user: data.user, session: data.session }
  },

  // Clear all authentication data from browser storage
  async clearAllAuthData() {
    try {
      // Clear localStorage
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Clear sessionStorage
      const sessionKeysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth'))) {
          sessionKeysToRemove.push(key)
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

      // Clear Supabase instance
      clearSupabaseAuth()

      console.log('Cleared auth data from browser storage')
    } catch (error) {
      console.error('Error clearing auth data:', error)
    }
  },

  // Sign out
  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return { error: error?.message }
  },

  // Get current session
  async getSession() {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error: error?.message }
  },

  // Get current user
  async getUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error: error?.message }
  },

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const supabase = createClient()
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error checking admin status:', error)
        return false
      }

      return profile?.role === 'admin'
    } catch (error) {
      console.error('Error in isAdmin:', error)
      return false
    }
  },

  // Get user profile with caching and deduplication
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      // Check cache first
      const cached = profileCache.get(userId)
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.profile
      }

      // Check if request is already in progress
      if (activeRequests.has(userId)) {
        return await activeRequests.get(userId)!
      }

      // Create new request
      const requestPromise = this._fetchProfileFromDB(userId)
      activeRequests.set(userId, requestPromise)

      try {
        const profile = await requestPromise

        // Cache the result
        profileCache.set(userId, {
          profile,
          timestamp: Date.now()
        })

        return profile
      } finally {
        // Clean up active request
        activeRequests.delete(userId)
      }
    } catch (error) {
      console.error('Error in getProfile:', error)
      return null
    }
  },

  // Internal method to fetch profile from database
  async _fetchProfileFromDB(userId: string): Promise<Profile | null> {
    try {
      const supabase = createClient()
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error getting profile:', error)
        return null
      }

      return profile
    } catch (error) {
      console.error('Error in _fetchProfileFromDB:', error)
      return null
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<Profile>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Invalidate cache after successful update
    profileCache.delete(userId)
    activeRequests.delete(userId)

    return { profile: data }
  },

  // Change user password
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        return { error: 'User not authenticated' }
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      })

      if (verifyError) {
        return { error: 'Current password is incorrect' }
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        return { error: updateError.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Change password error:', error)
      return { error: 'An unexpected error occurred' }
    }
  },

  // Create member account (admin only)
  async createMember(memberData: CreateMemberData, adminUserId: string) {
    const supabase = createClient()

    // Check if current user is admin
    const isAdmin = await auth.isAdmin(adminUserId)
    if (!isAdmin) {
      return { error: 'Unauthorized: Admin access required' }
    }

    // Create auth user (this would typically be done server-side)
    // For now, return a placeholder response
    return { error: 'Member creation must be done through admin panel' }
  },

  // Test database connection
  async testConnection() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('profiles').select('count').limit(1)

      if (error) {
        console.error('Database connection test failed:', error)
        return { connected: false, error: error.message }
      }

      return { connected: true, data }
    } catch (error) {
      console.error('Database connection test error:', error)
      return { connected: false, error: 'Connection failed' }
    }
  }
}