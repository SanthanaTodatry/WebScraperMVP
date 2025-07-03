import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { useScrapingStore } from '../../stores/scrapingStore'
import { Globe, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export const StatsOverview: React.FC = () => {
  const { jobs, projects } = useScrapingStore()

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: Globe,
      color: 'text-primary-600',
      bg: 'bg-primary-100',
    },
    {
      label: 'Total Jobs',
      value: jobs.length,
      icon: Clock,
      color: 'text-secondary-600',
      bg: 'bg-secondary-100',
    },
    {
      label: 'Completed',
      value: jobs.filter(job => job.status === 'completed').length,
      icon: CheckCircle,
      color: 'text-success-600',
      bg: 'bg-success-100',
    },
    {
      label: 'Failed',
      value: jobs.filter(job => job.status === 'failed').length,
      icon: AlertCircle,
      color: 'text-error-600',
      bg: 'bg-error-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}