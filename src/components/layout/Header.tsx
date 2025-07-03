import React from 'react'
import { Settings, Globe } from 'lucide-react'
import { Button } from '../ui/Button'

export const Header: React.FC = () => {
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

          {/* Settings Button */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}