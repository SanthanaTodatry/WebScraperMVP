import React from 'react'
import { User, Settings, LogOut, Globe } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'

export const Header: React.FC = () => {
  const { user, signOut } = useAuthStore()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Web Scraper</h1>
              <p className="text-xs text-gray-500">Intelligent Content Extraction</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Projects
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Analytics
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              Settings
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500">Premium Plan</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}