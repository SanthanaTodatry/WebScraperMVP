import React from 'react'
import { cn } from '../../utils/cn'

interface StatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const variants = {
    pending: 'bg-warning-100 text-warning-800 border-warning-200',
    processing: 'bg-primary-100 text-primary-800 border-primary-200',
    completed: 'bg-success-100 text-success-800 border-success-200',
    failed: 'bg-error-100 text-error-800 border-error-200',
  }

  const labels = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[status],
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full mr-1.5', {
        'bg-warning-500': status === 'pending',
        'bg-primary-500 animate-pulse': status === 'processing',
        'bg-success-500': status === 'completed',
        'bg-error-500': status === 'failed',
      })} />
      {labels[status]}
    </span>
  )
}