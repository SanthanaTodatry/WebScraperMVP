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
      set({ user: null })
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
        console.error('Supabase environment variables not found')
        set({ error: 'Application not configured. Please set up Supabase credentials.', initialized: true })
        return
      }
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Auth initialization error:', error)
        set({ error: error.message })
      } else {
        console.log('Current user:', user)
        set({ user })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user)
        set({ user: session?.user ?? null, error: null })
      })
      
      set({ initialized: true })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ error: 'Failed to initialize authentication', initialized: true })
    }
  },
}))