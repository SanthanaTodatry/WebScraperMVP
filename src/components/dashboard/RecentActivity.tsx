import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { StatusBadge } from '../ui/StatusBadge'
import { useScrapingStore } from '../../stores/scrapingStore'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Clock, Globe } from 'lucide-react'

export const RecentActivity: React.FC = () => {
  const { jobs, fetchJobs } = useScrapingStore()

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const recentJobs = jobs.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </h3>
        <p className="text-gray-600">Latest scraping jobs and their status</p>
      </CardHeader>
      <CardContent>
        {recentJobs.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No scraping jobs yet</p>
            <p className="text-sm text-gray-400">Start by creating your first scraping job above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {new URL(job.url).hostname}
                    </p>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </p>
                </div>
                <StatusBadge status={job.status as any} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}