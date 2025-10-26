"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, HelpCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useMemo } from "react"

interface StatsCardsProps {
  comments?: any[]
  onViewHighPriority?: () => void
}

export function StatsCards({ comments = [], onViewHighPriority }: StatsCardsProps) {
  const stats = useMemo(() => {
    console.log("[v0] Calculating stats from", comments.length, "comments")

    const totalComments = comments.length

    const questions = comments.filter((comment) => comment.isQuestion === true).length

    const highPriority = comments.filter((comment) => comment.priorityScore > 300).length

    const questionPercentage = totalComments > 0 ? Math.round((questions / totalComments) * 100) : 0

    console.log("[v0] Stats calculated:", { totalComments, questions, highPriority, questionPercentage })

    return {
      totalComments,
      questions,
      highPriority,
      questionPercentage,
    }
  }, [comments])

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="border-2 hover:border-red-200 dark:hover:border-red-900 transition-colors hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Total Comments</CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-3xl font-bold">{stats.totalComments.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground font-medium">
            {stats.totalComments === 0 ? "No comments yet" : "Across all videos"}
          </p>
        </CardContent>
      </Card>
      <Card className="border-2 hover:border-red-200 dark:hover:border-red-900 transition-colors hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Questions</CardTitle>
          <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
            <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-500" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-3xl font-bold">{stats.questions.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground font-medium">{stats.questionPercentage}% of total comments</p>
        </CardContent>
      </Card>
      <Card className="border-2 hover:border-red-200 dark:hover:border-red-900 transition-colors hover:shadow-lg md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">High Priority</CardTitle>
          <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-500" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-3xl font-bold">{stats.highPriority.toLocaleString()}</div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-orange-600 dark:text-orange-500 font-medium">
              {stats.highPriority === 0 ? "All caught up!" : "Needs your attention"}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold"
              onClick={onViewHighPriority}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
