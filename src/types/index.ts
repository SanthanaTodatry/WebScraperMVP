export interface ScrapingJob {
  id: string
  project_id: string
  user_id: string
  url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  firecrawl_job_id?: string
  ai_analysis_prompt?: string
  created_at: string
  completed_at?: string
  error_message?: string
}

export interface ScrapingResult {
  id: string
  job_id: string
  raw_content: any
  extracted_data: any
  ai_analysis: any
  metadata: any
  created_at: string
}

export interface ScrapingProject {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  openai_api_key?: string
  firecrawl_api_key?: string
  default_ai_prompt?: string
  settings: any
  created_at: string
  updated_at: string
}

export interface FirecrawlResponse {
  success: boolean
  data: {
    content: string
    markdown: string
    html: string
    metadata: {
      title: string
      description: string
      language: string
      sourceURL: string
      [key: string]: any
    }
    links: Array<{
      text: string
      href: string
    }>
  }
  error?: string
}

export interface AIAnalysisRequest {
  content: string
  prompt: string
  model?: 'gpt-4' | 'gpt-3.5-turbo'
}

export interface AIAnalysisResponse {
  extractedData: any
  summary: string
  insights: string[]
  confidence: number
  processingTime: number
}