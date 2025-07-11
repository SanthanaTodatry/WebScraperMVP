import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Globe, Zap, Brain, Clock, AlertCircle } from 'lucide-react'
import { useScrapingStore } from '../../stores/scrapingStore'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

interface QuickStartFormData {
  url: string
  aiPrompt: string
}

export const QuickStart: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false)
  const { createJob, projects, fetchProjects } = useScrapingStore()
  const { user } = useAuthStore()
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset, 
    setValue,
    watch
  } = useForm<QuickStartFormData>({
    mode: 'onChange'
  })

  // Watch the URL field for real-time validation
  const watchedUrl = watch('url')

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [fetchProjects, user])

  // Use the first project or wait for it to be created
  const defaultProject = projects[0]

  // Check if API keys are configured
  const firecrawlConfigured = !!import.meta.env.VITE_FIRECRAWL_API_KEY
  const openaiConfigured = !!import.meta.env.VITE_OPENAI_API_KEY

  // Determine if the button should be disabled
  const isButtonDisabled = !defaultProject || !firecrawlConfigured || isValidating || !watchedUrl?.trim()

  const onSubmit = async (data: QuickStartFormData) => {
    console.log('Form submitted with data:', data)
    
    if (!defaultProject) {
      toast.error('No project available. Please wait for the default project to be created.')
      return
    }

    if (!firecrawlConfigured) {
      toast.error('Firecrawl API key not configured. Please add VITE_FIRECRAWL_API_KEY to your environment variables.')
      return
    }
    
    try {
      setIsValidating(true)
      
      // Add protocol if missing
      let url = data.url.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      
      console.log('Creating job with URL:', url)
      await createJob(defaultProject.id, url, data.aiPrompt)
      toast.success('Scraping job created successfully! Processing will begin shortly.')
      reset()
    } catch (error) {
      console.error('Job creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create scraping job')
    } finally {
      setIsValidating(false)
    }
  }

  const handlePromptClick = (prompt: string) => {
    setValue('aiPrompt', prompt)
  }

  const aiPrompts = [
    'Extract all contact information including emails, phone numbers, and addresses',
    'Summarize the main content and identify key topics',
    'Extract product information including names, prices, and descriptions',
    'Identify and extract all links and navigation elements',
    'Extract company information including description, services, and team members',
  ]

  return (
    <div className="space-y-6">
      {/* API Configuration Status */}
      {(!firecrawlConfigured || !openaiConfigured) && (
        <Card className="border-warning-200 bg-warning-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-warning-800">API Configuration Required</h4>
                <div className="mt-1 text-sm text-warning-700">
                  {!firecrawlConfigured && (
                    <p>• Firecrawl API key is required for web scraping functionality</p>
                  )}
                  {!openaiConfigured && (
                    <p>• OpenAI API key is optional but required for AI analysis features</p>
                  )}
                  <p className="mt-2">Please add the required API keys to your .env file to enable full functionality.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl">
            <Globe className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Web Scraping
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Extract and analyze content from any website with intelligent AI processing. 
          Get structured data and insights in seconds.
        </p>
      </div>

      {/* Quick Start Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Quick Start</h3>
          <p className="text-gray-600">Enter a URL to begin scraping with AI analysis</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Website URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('url', { 
                    required: 'URL is required',
                    validate: (value) => {
                      if (!value || !value.trim()) {
                        return 'URL is required'
                      }
                      // More permissive URL validation
                      const trimmedValue = value.trim()
                      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i
                      if (!urlPattern.test(trimmedValue)) {
                        return 'Please enter a valid URL (e.g., example.com or https://example.com)'
                      }
                      return true
                    }
                  })}
                  className="block w-full rounded-lg border border-gray-300 pl-10 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                  placeholder="https://example.com"
                />
              </div>
              {errors.url && (
                <p className="text-sm text-error-600">{errors.url.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                AI Analysis Prompt {!openaiConfigured && <span className="text-warning-600">(Optional - requires OpenAI API key)</span>}
              </label>
              <textarea
                {...register('aiPrompt')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
                placeholder={openaiConfigured ? "Tell the AI what information to extract..." : "AI analysis requires OpenAI API key configuration"}
                disabled={!openaiConfigured}
              />
              {errors.aiPrompt && (
                <p className="text-sm text-error-600">{errors.aiPrompt.message}</p>
              )}
            </div>
            
            <button
              type="submit" 
              className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-4 py-2 text-base w-full"
              disabled={isButtonDisabled}
            >
              {isValidating && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              <Zap className="h-4 w-4 mr-2" />
              Start Web Scraping
            </button>
            
            {/* Status Messages */}
            <div className="space-y-2">
              {!defaultProject && (
                <p className="text-sm text-warning-600 text-center">
                  Creating default project...
                </p>
              )}
              
              {!firecrawlConfigured && (
                <p className="text-sm text-error-600 text-center">
                  Firecrawl API key required to start scraping
                </p>
              )}

              {!watchedUrl?.trim() && (
                <p className="text-sm text-gray-500 text-center">
                  Please enter a URL to enable scraping
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* AI Prompt Suggestions */}
      {openaiConfigured && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Prompt Suggestions
            </h3>
            <p className="text-gray-600">Popular extraction prompts to get you started</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiPrompts.map((prompt, index) => (
                <div 
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handlePromptClick(prompt)}
                >
                  <p className="text-sm text-gray-700">{prompt}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-600">
              Scrape and analyze websites in seconds with Firecrawl's optimized infrastructure
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Advanced OpenAI analysis to extract meaningful insights from any content
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent-600" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time</h3>
            <p className="text-sm text-gray-600">
              Live updates and collaborative features for team workflows
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}