import { create } from 'zustand'
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

// Mock data for demonstration
const mockProjects: ScrapingProject[] = [
  {
    id: '1',
    user_id: 'demo-user',
    name: 'Demo Project',
    description: 'A sample project for testing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
]

const mockJobs: ScrapingJob[] = [
  {
    id: '1',
    project_id: '1',
    user_id: 'demo-user',
    url: 'https://example.com',
    status: 'completed',
    ai_analysis_prompt: 'Extract main content and summarize',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    completed_at: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
  },
  {
    id: '2',
    project_id: '1',
    user_id: 'demo-user',
    url: 'https://news.ycombinator.com',
    status: 'processing',
    ai_analysis_prompt: 'Extract top stories and their scores',
    created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
  },
  {
    id: '3',
    project_id: '1',
    user_id: 'demo-user',
    url: 'https://github.com',
    status: 'failed',
    ai_analysis_prompt: 'Extract trending repositories',
    created_at: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    error_message: 'Rate limit exceeded',
  }
]

export const useScrapingStore = create<ScrapingState>((set, get) => ({
  projects: mockProjects,
  jobs: mockJobs,
  results: [],
  loading: false,
  error: null,

  createProject: async (name: string, description?: string) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newProject: ScrapingProject = {
        id: Date.now().toString(),
        user_id: 'demo-user',
        name,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      set((state) => ({
        projects: [...state.projects, newProject],
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Projects are already loaded with mock data
      set({ loading: false })
    } catch (error) {
      console.error('Fetch projects error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  createJob: async (projectId: string, url: string, aiPrompt?: string) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newJob: ScrapingJob = {
        id: Date.now().toString(),
        project_id: projectId,
        user_id: 'demo-user',
        url,
        status: 'pending',
        ai_analysis_prompt: aiPrompt,
        created_at: new Date().toISOString(),
      }

      set((state) => ({
        jobs: [newJob, ...state.jobs],
        loading: false,
      }))

      // Simulate job processing
      setTimeout(() => {
        get().updateJobStatus(newJob.id, 'processing')
      }, 2000)
      
      setTimeout(() => {
        get().updateJobStatus(newJob.id, 'completed')
      }, 5000)
      
    } catch (error) {
      console.error('Create job error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  fetchJobs: async (projectId?: string) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let jobs = mockJobs
      if (projectId) {
        jobs = jobs.filter(job => job.project_id === projectId)
      }
      
      set({ jobs, loading: false })
    } catch (error) {
      console.error('Fetch jobs error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  fetchResults: async (jobId?: string) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock results would go here
      set({ results: [], loading: false })
    } catch (error) {
      console.error('Fetch results error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  updateJobStatus: async (jobId: string, status: string, errorMessage?: string) => {
    try {
      // Update local state
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === jobId
            ? { 
                ...job, 
                status: status as any, 
                error_message: errorMessage,
                completed_at: status === 'completed' ? new Date().toISOString() : job.completed_at
              }
            : job
        ),
      }))
    } catch (error) {
      console.error('Update job status error:', error)
    }
  },
}))