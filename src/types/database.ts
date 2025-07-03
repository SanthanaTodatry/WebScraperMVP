export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scraping_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scraping_jobs: {
        Row: {
          id: string
          project_id: string
          user_id: string
          url: string
          status: string
          firecrawl_job_id: string | null
          ai_analysis_prompt: string | null
          created_at: string
          completed_at: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          url: string
          status?: string
          firecrawl_job_id?: string | null
          ai_analysis_prompt?: string | null
          created_at?: string
          completed_at?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          url?: string
          status?: string
          firecrawl_job_id?: string | null
          ai_analysis_prompt?: string | null
          created_at?: string
          completed_at?: string | null
          error_message?: string | null
        }
      }
      scraping_results: {
        Row: {
          id: string
          job_id: string
          raw_content: any
          extracted_data: any
          ai_analysis: any
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          raw_content?: any
          extracted_data?: any
          ai_analysis?: any
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          raw_content?: any
          extracted_data?: any
          ai_analysis?: any
          metadata?: any
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          openai_api_key: string | null
          firecrawl_api_key: string | null
          default_ai_prompt: string | null
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          openai_api_key?: string | null
          firecrawl_api_key?: string | null
          default_ai_prompt?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          openai_api_key?: string | null
          firecrawl_api_key?: string | null
          default_ai_prompt?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}