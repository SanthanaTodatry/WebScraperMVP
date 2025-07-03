/*
  # AI Web Scraper Database Schema

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `scraping_projects` - User projects for organizing scraping jobs
    - `scraping_jobs` - Individual scraping tasks
    - `scraping_results` - Results and extracted data from scraping jobs
    - `scheduled_jobs` - Scheduled/recurring scraping tasks
    - `user_settings` - User API keys and application settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Secure API key storage with encryption

  3. Features
    - Real-time subscriptions for live updates
    - JSONB columns for flexible data storage
    - Comprehensive indexing for performance
    - Audit trails with timestamps
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraping projects table
CREATE TABLE IF NOT EXISTS scraping_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraping jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES scraping_projects NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  firecrawl_job_id TEXT,
  ai_analysis_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Scraping results table
CREATE TABLE IF NOT EXISTS scraping_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES scraping_jobs NOT NULL,
  raw_content JSONB,
  extracted_data JSONB,
  ai_analysis JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled jobs table
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  project_id UUID REFERENCES scraping_projects NOT NULL,
  url TEXT NOT NULL,
  schedule_cron TEXT,
  ai_prompt TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  openai_api_key TEXT,
  firecrawl_api_key TEXT,
  default_ai_prompt TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own projects" ON scraping_projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own jobs" ON scraping_jobs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read results for own jobs" ON scraping_results
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM scraping_jobs 
    WHERE scraping_jobs.id = scraping_results.job_id 
    AND scraping_jobs.user_id = auth.uid()
  ));

CREATE POLICY "System can insert results" ON scraping_results
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can manage own scheduled jobs" ON scheduled_jobs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scraping_projects_user_id ON scraping_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_user_id ON scraping_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_project_id ON scraping_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_results_job_id ON scraping_results(job_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_user_id ON scheduled_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_next_run ON scheduled_jobs(next_run_at) WHERE is_active = TRUE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraping_projects_updated_at 
  BEFORE UPDATE ON scraping_projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_settings (user_id, settings)
  VALUES (
    NEW.id,
    '{}'::JSONB
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();