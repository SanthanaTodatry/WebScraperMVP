import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  clearError: () => void
}

// Fixed anonymous user ID for consistent database operations
const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'

// Create anonymous user object
const createAnonymousUser = (): User => ({
  id: ANONYMOUS_USER_ID,
  email: 'anonymous@scraper.local',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    full_name: 'Anonymous User'
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
})

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  clearError: () => set({ error: null }),

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      console.log('Attempting to sign in with:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        throw error
      }
      
      console.log('Sign in successful:', data)
      set({ user: data.user })
    } catch (error) {
      console.error('Sign in error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    set({ loading: true, error: null })
    try {
      console.log('Attempting to sign up with:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      
      if (error) {
        console.error('Sign up error:', error)
        throw error
      }
      
      console.log('Sign up successful:', data)
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        set({ error: 'Please check your email to confirm your account' })
      } else {
        set({ user: data.user })
      }
    } catch (error) {
      console.error('Sign up error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // Set back to anonymous user instead of null
      set({ user: createAnonymousUser() })
    } catch (error) {
      console.error('Sign out error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  initialize: async () => {
    try {
      console.log('Initializing auth...')
      
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase environment variables not found, using anonymous user')
        set({ user: createAnonymousUser(), error: null, initialized: true })
        return
      }
      
      // Get current session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        // Use anonymous user on session errors
        set({ user: createAnonymousUser(), error: null, initialized: true })
        return
      }
      
      // If we have a session, use the authenticated user
      if (session?.user) {
        console.log('Found existing session for user:', session.user.email)
        set({ user: session.user })
      } else {
        console.log('No existing session found, using anonymous user')
        set({ user: createAnonymousUser() })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        // If user signs out or session ends, fall back to anonymous user
        set({ user: session?.user ?? createAnonymousUser(), error: null })
      })
      
      set({ initialized: true, error: null })
    } catch (error) {
      console.error('Auth initialization error:', error)
      // Always fall back to anonymous user to ensure app functionality
      set({ user: createAnonymousUser(), error: null, initialized: true })
    }
  },
}))