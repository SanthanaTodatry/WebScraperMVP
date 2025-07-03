import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import { useScrapingStore } from './stores/scrapingStore'
import { AuthForm } from './components/auth/AuthForm'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './components/dashboard/Dashboard'

const queryClient = new QueryClient()

function App() {
  const { user, loading, initialized, initialize } = useAuthStore()
  const { fetchProjects } = useScrapingStore()
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, fetchProjects])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthForm />
        <Toaster position="top-right" />
      </QueryClientProvider>
    )
  }

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