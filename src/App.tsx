import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './components/dashboard/Dashboard'
import { useAuthStore } from './stores/authStore'
import { useScrapingStore } from './stores/scrapingStore'

const queryClient = new QueryClient()

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { initialize, initialized, user } = useAuthStore()
  const { createProject, projects, loading: scrapingLoading } = useScrapingStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    // Create a default project if none exists and user is authenticated
    if (initialized && user && projects.length === 0) {
      createProject('Default Project', 'Your default scraping project')
        .catch(console.error)
    }
  }, [initialized, user, projects.length, createProject])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'projects':
        return <div className="p-8 text-center text-gray-500">Projects view coming soon...</div>
      case 'scheduled':
        return <div className="p-8 text-center text-gray-500">Scheduled jobs view coming soon...</div>
      case 'analytics':
        return <div className="p-8 text-center text-gray-500">Analytics view coming soon...</div>
      case 'team':
        return <div className="p-8 text-center text-gray-500">Team view coming soon...</div>
      case 'settings':
        return <div className="p-8 text-center text-gray-500">Settings view coming soon...</div>
      default:
        return <Dashboard />
    }
  }

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

  // Show project creation loading state
  if (initialized && user && scrapingLoading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Creating your default project...</p>
          <p className="text-sm text-gray-500 mt-2">This will only take a moment</p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex h-[calc(100vh-64px)]">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              {renderContent()}
            </div>
          </main>
        </div>
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