import { create } from 'zustand'
import { ScrapingJob, ScrapingResult, ScrapingProject } from '../types'
import { supabase } from '../lib/supabase'
import { getFirecrawlClient } from '../lib/firecrawl'
import { getOpenAIClient } from '../lib/openai'
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
  processScrapingJob: (jobId: string, url: string, aiPrompt?: string) => Promise<void>
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
      const authState = useAuthStore.getState()
      
      if (!authState.isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Please set up your environment variables to use this feature.')
      }
      
      if (!authState.user) {
        throw new Error('You must be signed in to create projects. Please sign in or sign up first.')
      }

      const { data, error } = await supabase
        .from('scraping_projects')
        .insert({
          user_id: authState.user.id,
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
      const authState = useAuthStore.getState()
      
      if (!authState.isSupabaseConfigured) {
        set({ projects: [], loading: false, error: 'Supabase is not configured' })
        return
      }
      
      if (!authState.user) {
        set({ projects: [], loading: false, error: 'You must be signed in to view projects' })
        return
      }

      const { data, error } = await supabase
        .from('scraping_projects')
        .select('*')
        .eq('user_id', authState.user.id)
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
      const authState = useAuthStore.getState()
      
      if (!authState.isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Please set up your environment variables to use this feature.')
      }
      
      if (!authState.user) {
        throw new Error('You must be signed in to create scraping jobs. Please sign in or sign up first.')
      }

      const { data, error } = await supabase
        .from('scraping_jobs')
        .insert({
          project_id: projectId,
          user_id: authState.user.id,
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

      // Start processing the job immediately
      get().processScrapingJob(data.id, url, aiPrompt)
      
    } catch (error) {
      console.error('Create job error:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
      throw error
    }
  },

  processScrapingJob: async (jobId: string, url: string, aiPrompt?: string) => {
    try {
      // Update status to processing
      await get().updateJobStatus(jobId, 'processing')

      const firecrawlClient = getFirecrawlClient()
      if (!firecrawlClient) {
        throw new Error('Firecrawl API key not configured. Please add VITE_FIRECRAWL_API_KEY to your environment variables.')
      }

      // Scrape the website using Firecrawl
      console.log('Starting Firecrawl scraping for:', url)
      const scrapeResult = await firecrawlClient.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        timeout: 30000,
      })

      if (!scrapeResult.success || !scrapeResult.data) {
        throw new Error(scrapeResult.error || 'Failed to scrape website')
      }

      console.log('Firecrawl scraping completed successfully')

      // Extract structured data from the scraped content
      const extractedData = {
        title: scrapeResult.data.metadata?.title || 'No title found',
        description: scrapeResult.data.metadata?.description || '',
        language: scrapeResult.data.metadata?.language || 'unknown',
        content: scrapeResult.data.content || '',
        markdown: scrapeResult.data.markdown || '',
        links: scrapeResult.data.links || [],
        wordCount: scrapeResult.data.content ? scrapeResult.data.content.split(' ').length : 0,
        headings: extractHeadings(scrapeResult.data.markdown || ''),
        paragraphs: extractParagraphs(scrapeResult.data.content || ''),
      }

      // Perform AI analysis if prompt is provided
      let aiAnalysis = null
      if (aiPrompt) {
        console.log('Starting AI analysis...')
        const openaiClient = getOpenAIClient()
        if (openaiClient) {
          try {
            aiAnalysis = await openaiClient.analyzeContent({
              content: scrapeResult.data.content || scrapeResult.data.markdown || '',
              prompt: aiPrompt,
              model: 'gpt-3.5-turbo'
            })
            console.log('AI analysis completed successfully')
          } catch (aiError) {
            console.error('AI analysis failed:', aiError)
            aiAnalysis = {
              extractedData: { error: 'AI analysis failed' },
              summary: 'AI analysis could not be completed',
              insights: ['AI analysis failed - check OpenAI API configuration'],
              confidence: 0,
              processingTime: 0
            }
          }
        } else {
          console.warn('OpenAI API key not configured, skipping AI analysis')
          aiAnalysis = {
            extractedData: { note: 'AI analysis skipped - OpenAI API key not configured' },
            summary: 'AI analysis was not performed due to missing API configuration',
            insights: ['Configure OpenAI API key to enable AI analysis'],
            confidence: 0,
            processingTime: 0
          }
        }
      }

      // Prepare metadata
      const metadata = {
        scrapedAt: new Date().toISOString(),
        processingTime: 0, // Will be calculated
        sourceUrl: url,
        firecrawlMetadata: scrapeResult.data.metadata,
        wordCount: extractedData.wordCount,
        language: extractedData.language,
        hasAiAnalysis: !!aiAnalysis,
      }

      // Save the results
      await get().saveScrapingResult(
        jobId,
        {
          html: scrapeResult.data.html,
          markdown: scrapeResult.data.markdown,
          content: scrapeResult.data.content,
          metadata: scrapeResult.data.metadata,
        },
        extractedData,
        aiAnalysis,
        metadata
      )

      // Update job status to completed
      await get().updateJobStatus(jobId, 'completed')
      console.log('Scraping job completed successfully')

    } catch (error) {
      console.error('Scraping job processing error:', error)
      await get().updateJobStatus(jobId, 'failed', error instanceof Error ? error.message : 'Unknown error')
    }
  },

  fetchJobs: async (projectId?: string) => {
    set({ loading: true, error: null })
    try {
      const authState = useAuthStore.getState()
      
      if (!authState.isSupabaseConfigured) {
        set({ jobs: [], loading: false, error: 'Supabase is not configured' })
        return
      }
      
      if (!authState.user) {
        set({ jobs: [], loading: false, error: 'You must be signed in to view jobs' })
        return
      }

      let query = supabase
        .from('scraping_jobs')
        .select('*')
        .eq('user_id', authState.user.id)
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
      const authState = useAuthStore.getState()
      
      if (!authState.isSupabaseConfigured) {
        set({ results: [], loading: false, error: 'Supabase is not configured' })
        return
      }

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
      const authState = useAuthStore.getState()
      
      if (!authState.isSupabaseConfigured || !authState.user) {
        throw new Error('Authentication required to update job status')
      }

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
      const authState = useAuthStore.getState()
      
      if (!authState.isSupabaseConfigured || !authState.user) {
        throw new Error('Authentication required to save scraping results')
      }

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

// Helper functions for content extraction
function extractHeadings(markdown: string): string[] {
  const headingRegex = /^#{1,6}\s+(.+)$/gm
  const headings: string[] = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push(match[1].trim())
  }

  return headings
}

function extractParagraphs(content: string): string[] {
  return content
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 50) // Only include substantial paragraphs
    .slice(0, 10) // Limit to first 10 paragraphs
}