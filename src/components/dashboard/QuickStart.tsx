import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Globe, Zap, Brain, Clock } from 'lucide-react'
import { useScrapingStore } from '../../stores/scrapingStore'
import toast from 'react-hot-toast'

interface QuickStartFormData {
  url: string
  aiPrompt: string
}

export const QuickStart: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false)
  const { createJob, projects } = useScrapingStore()
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<QuickStartFormData>({
    defaultValues: {
      url: '',
      aiPrompt: ''
    }
  })

  // Use the first project or create a default one
  const defaultProject = projects[0] || { id: '1', name: 'Demo Project' }

  const onSubmit = async (data: QuickStartFormData) => {
    try {
      setIsValidating(true)
      
      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      if (!data.url || !data.url.trim()) {
        throw new Error('Please enter a URL')
      }
      
      if (!urlPattern.test(data.url.trim())) {
        throw new Error('Please enter a valid URL')
      }

      // Add protocol if missing
      let url = data.url.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      
      await createJob(defaultProject.id, url, data.aiPrompt)
      toast.success('Scraping job created successfully!')
      reset()
    } catch (error) {
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
            <Input
              label="Website URL"
              placeholder="https://example.com"
              icon={<Globe className="h-5 w-5 text-gray-400" />}
              {...register('url', { 
                required: 'URL is required',
                validate: (value) => {
                  if (!value || !value.trim()) {
                    return 'URL is required'
                  }
                  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
                  if (!urlPattern.test(value.trim())) {
                    return 'Please enter a valid URL'
                  }
                  return true
                }
              })}
              error={errors.url?.message}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                AI Analysis Prompt
              </label>
              <textarea
                {...register('aiPrompt', { required: 'AI prompt is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Tell the AI what information to extract..."
              />
              {errors.aiPrompt && (
                <p className="text-sm text-error-600">{errors.aiPrompt.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              loading={isValidating}
            >
              <Zap className="h-4 w-4 mr-2" />
              Start AI Scraping
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Prompt Suggestions */}
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
              Scrape and analyze websites in seconds with our optimized infrastructure
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
              Advanced AI analysis to extract meaningful insights from any content
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