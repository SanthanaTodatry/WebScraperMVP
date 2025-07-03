import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Dashboard } from './components/dashboard/Dashboard'
import { useAuthStore } from './stores/authStore'
import { useScrapingStore } from './stores/scrapingStore'

const queryClient = new QueryClient()

function App() {
  const { initialize, initialized, user } = useAuthStore()
  const { createProject, projects } = useScrapingStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    // Create a default project if none exists and user is available
    if (initialized && user && projects.length === 0) {
      createProject('Default Scraping Project', 'Your main scraping workspace')
        .catch(console.error)
    }
  }, [initialized, user, projects.length, createProject])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Simple header with just the logo */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Web Scraper</h1>
                  <p className="text-xs text-gray-500">Intelligent Content Extraction</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Dashboard />
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App