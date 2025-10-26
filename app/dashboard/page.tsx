"use client"

import { useRef, useState } from "react"
import { CommentsTable } from "@/components/comments-table"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { ChannelVerification } from "@/components/channel-verification"

export default function DashboardPage() {
  const commentsTableRef = useRef<HTMLDivElement>(null)
  const [comments, setComments] = useState<any[]>([])
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)

  const handleViewHighPriority = () => {
    commentsTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    window.dispatchEvent(new CustomEvent("filterHighPriority"))
  }

  const handleChannelSelect = (channelId: string) => {
    console.log("[v0] Dashboard received channelId:", channelId)
    setSelectedChannelId(channelId)
  }

  const handleCommentsLoaded = (loadedComments: any[]) => {
    console.log("[v0] Dashboard received", loadedComments.length, "comments")
    setComments(loadedComments)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-red-50/20 dark:to-red-950/5">
      <DashboardHeader />
      <main className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        <ChannelVerification onChannelSelect={handleChannelSelect} />
        <StatsCards comments={comments} onViewHighPriority={handleViewHighPriority} />
        <div ref={commentsTableRef}>
          <CommentsTable channelId={selectedChannelId} onCommentsLoaded={handleCommentsLoaded} />
        </div>
      </main>
    </div>
  )
}
