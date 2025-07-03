import React from 'react'
import { QuickStart } from './QuickStart'
import { StatsOverview } from './StatsOverview'
import { RecentActivity } from './RecentActivity'

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <StatsOverview />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <QuickStart />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}