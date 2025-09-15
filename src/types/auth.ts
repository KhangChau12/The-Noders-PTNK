import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js'
import { Profile } from './database'

export interface AuthUser extends SupabaseUser {
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export interface AuthSession extends SupabaseSession {
  user: AuthUser
}

export interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  session: AuthSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string; success?: boolean }>
  isAdmin: boolean
}

export interface LoginFormData {
  email: string
  password: string
}

export interface CreateMemberData {
  email: string
  full_name: string
  username: string
  role?: 'admin' | 'member'
}