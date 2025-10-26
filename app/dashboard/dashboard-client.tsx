'use client'

import { useRef } from 'react'
import { CommentsTable } from '@/components/comments-table'
import { DashboardHeader } from '@/components/dashboard-header'
import { StatsCards } from '@/components/stats-cards'

export default function DashboardClient({
  user,
  youtubeToken,
}: {
  user?: { email?: string }
  youtubeToken?: string
}) {
  const commentsTableRef = useRef<HTMLDivElement>(null)

  const handleViewHighPriority = () => {
    commentsTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.dispatchEvent(new CustomEvent('filterHighPriority'))
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-red-50/20 dark:to-red-950/5">
      <DashboardHeader />

      <main className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        <div className="text-sm text-muted-foreground text-right pr-2">
          Welcome{' '}
          <span className="font-medium text-foreground text-center">
            {user?.email ?? 'Loading...'}
          </span>
        </div>

        <StatsCards onViewHighPriority={handleViewHighPriority} />

        <div ref={commentsTableRef}>
          <CommentsTable initialFilter="high-priority" />
        </div>
      </main>
    </div>
  )
}
