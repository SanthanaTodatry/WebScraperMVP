import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { ScrapingJob, ScrapingResult, ScrapingProject } from '../types'

interface ScrapingState {
  projects: ScrapingProject[]
  jobs: ScrapingJob[]
  results: ScrapingResult[]
  loading: boolean
  error: string | null
  
  // Actions
  createProject: (name: string, description?: string) => Promise<void>
  fetchProjects: () => Promise<void>
  createJob: (projectId: string, url: string, aiPrompt?: string) => Promise<void>
  fetchJobs: (projectId?: string) => Promise<void>
  fetchResults: (jobId?: string) => Promise<void>
  updateJobStatus: (jobId: string, status: string, errorMessage?: string) => Promise<void>
}

export const useScrapingStore = create<ScrapingState>((set, get) => ({
  projects: [],
  jobs: [],
  results: [],
  loading: false,
  error: null,

  createProject: async (name: string, description?: string) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('scraping_projects')
        .insert([
          {
            user_id: user.id,
            name,
            description,
          },
        ])
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        projects: [...state.projects, data],
        loading: false,
      }))
    } catch (error) {
      console.error('Create project error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('scraping_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ projects: data || [], loading: false })
    } catch (error) {
      console.error('Fetch projects error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  createJob: async (projectId: string, url: string, aiPrompt?: string) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('scraping_jobs')
        .insert([
          {
            project_id: projectId,
            user_id: user.id,
            url,
            ai_analysis_prompt: aiPrompt,
            status: 'pending',
          },
        ])
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        jobs: [...state.jobs, data],
        loading: false,
      }))

      // TODO: Trigger actual scraping process
      // This would call your Edge Function or API endpoint
      
    } catch (error) {
      console.error('Create job error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  fetchJobs: async (projectId?: string) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from('scraping_jobs')
        .select('*')
        .eq('user_id', user.id)

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      set({ jobs: data || [], loading: false })
    } catch (error) {
      console.error('Fetch jobs error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  fetchResults: async (jobId?: string) => {
    set({ loading: true, error: null })
    try {
      let query = supabase
        .from('scraping_results')
        .select('*')

      if (jobId) {
        query = query.eq('job_id', jobId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      set({ results: data || [], loading: false })
    } catch (error) {
      console.error('Fetch results error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  updateJobStatus: async (jobId: string, status: string, errorMessage?: string) => {
    try {
      const { error } = await supabase
        .from('scraping_jobs')
        .update({
          status,
          error_message: errorMessage,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', jobId)

      if (error) throw error

      // Update local state
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === jobId
            ? { ...job, status, error_message: errorMessage }
            : job
        ),
      }))
    } catch (error) {
      console.error('Update job status error:', error)
    }
  },
}))