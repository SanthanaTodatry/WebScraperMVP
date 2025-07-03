import React from 'react'
import { 
  Home, 
  FolderOpen, 
  Clock, 
  BarChart3, 
  Users, 
  Settings, 
  Plus,
  Zap
} from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'scheduled', label: 'Scheduled', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="bg-white border-r border-gray-200 w-64 flex flex-col h-full">
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Scraping Job
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Upgrade Card */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-5 w-5" />
            <span className="font-semibold">Upgrade to Pro</span>
          </div>
          <p className="text-sm text-primary-100 mb-3">
            Unlock advanced AI features and unlimited scraping
          </p>
          <Button variant="outline" size="sm" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}