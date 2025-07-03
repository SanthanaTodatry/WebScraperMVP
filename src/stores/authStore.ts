import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null
  isSupabaseConfigured: boolean
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
  isSupabaseConfigured: false,

  clearError: () => set({ error: null }),

  signIn: async (email: string, password: string) => {
    const { isSupabaseConfigured } = get()
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }

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
    const { isSupabaseConfigured } = get()
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }

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
    const { isSupabaseConfigured } = get()
    if (!isSupabaseConfigured) {
      set({ user: null })
      return
    }

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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables not found')
        set({ 
          user: null, 
          error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.', 
          initialized: true,
          isSupabaseConfigured: false
        })
        return
      }
      
      set({ isSupabaseConfigured: true })
      
      // Get current session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        set({ user: null, error: sessionError.message, initialized: true })
        return
      }
      
      // If we have a session, use the authenticated user
      if (session?.user) {
        console.log('Found existing session for user:', session.user.email)
        set({ user: session.user })
      } else {
        console.log('No existing session found')
        set({ user: null })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        set({ user: session?.user ?? null, error: null })
      })
      
      set({ initialized: true, error: null })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ 
        user: null, 
        error: error instanceof Error ? error.message : 'Authentication initialization failed', 
        initialized: true,
        isSupabaseConfigured: false
      })
    }
  },
}))