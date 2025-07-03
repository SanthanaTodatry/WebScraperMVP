import { create } from 'zustand'
import { ScrapingJob, ScrapingResult, ScrapingProject } from '../types'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

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
  saveScrapingResult: (jobId: string, rawContent: any, extractedData: any, aiAnalysis: any, metadata: any) => Promise<void>
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
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('scraping_projects')
        .insert({
          user_id: user.id,
          name,
          description,
        })
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
      throw error
    }
  },

  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

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
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('scraping_jobs')
        .insert({
          project_id: projectId,
          user_id: user.id,
          url,
          ai_analysis_prompt: aiPrompt,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        jobs: [data, ...state.jobs],
        loading: false,
      }))

      // Simulate job processing
      setTimeout(() => {
        get().updateJobStatus(data.id, 'processing')
      }, 2000)
      
      setTimeout(async () => {
        await get().updateJobStatus(data.id, 'completed')
        
        // Simulate saving scraping results
        const mockRawContent = {
          html: '<html><body><h1>Sample Content</h1><p>This is mock scraped content from ' + url + '</p></body></html>',
          text: 'Sample Content\nThis is mock scraped content from ' + url,
          title: 'Sample Page Title',
          url: url
        }
        
        const mockExtractedData = {
          title: 'Sample Page Title',
          headings: ['Sample Content'],
          paragraphs: ['This is mock scraped content from ' + url],
          links: [{ text: 'Example Link', href: 'https://example.com' }],
          images: []
        }
        
        const mockAiAnalysis = {
          summary: 'This page contains sample content that demonstrates the scraping functionality.',
          keyTopics: ['web scraping', 'sample content', 'demonstration'],
          sentiment: 'neutral',
          confidence: 0.85,
          extractedInfo: {
            mainContent: 'Sample content extracted from the webpage',
            relevantData: 'Key information identified by AI analysis'
          }
        }
        
        const mockMetadata = {
          scrapedAt: new Date().toISOString(),
          processingTime: 3.2,
          wordCount: 12,
          language: 'en',
          charset: 'utf-8'
        }
        
        await get().saveScrapingResult(data.id, mockRawContent, mockExtractedData, mockAiAnalysis, mockMetadata)
      }, 5000)
      
    } catch (error) {
      console.error('Create job error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
      throw error
    }
  },

  fetchJobs: async (projectId?: string) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      let query = supabase
        .from('scraping_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

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
        .order('created_at', { ascending: false })

      if (jobId) {
        query = query.eq('job_id', jobId)
      }

      const { data, error } = await query

      if (error) throw error

      set({ results: data || [], loading: false })
    } catch (error) {
      console.error('Fetch results error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  updateJobStatus: async (jobId: string, status: string, errorMessage?: string) => {
    try {
      const updateData: any = { 
        status,
        error_message: errorMessage 
      }
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('scraping_jobs')
        .update(updateData)
        .eq('id', jobId)

      if (error) throw error

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
      throw error
    }
  },

  saveScrapingResult: async (jobId: string, rawContent: any, extractedData: any, aiAnalysis: any, metadata: any) => {
    try {
      const { data, error } = await supabase
        .from('scraping_results')
        .insert({
          job_id: jobId,
          raw_content: rawContent,
          extracted_data: extractedData,
          ai_analysis: aiAnalysis,
          metadata: metadata,
        })
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        results: [data, ...state.results],
      }))
    } catch (error) {
      console.error('Save scraping result error:', error)
      throw error
    }
  },
}))