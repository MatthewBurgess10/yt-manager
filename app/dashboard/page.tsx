"use client"

import { useRef } from "react"
import { CommentsTable } from "@/components/comments-table"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"

export default function DashboardPage() {
  const commentsTableRef = useRef<HTMLDivElement>(null)

  const handleViewHighPriority = () => {
    commentsTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    // Trigger high priority filter through a custom event
    window.dispatchEvent(new CustomEvent("filterHighPriority"))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-50/20 dark:to-red-950/5">
      <DashboardHeader />
      <main className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        <StatsCards onViewHighPriority={handleViewHighPriority} />
        <div ref={commentsTableRef}>
          <CommentsTable />
        </div>
      </main>
    </div>
  )
}
