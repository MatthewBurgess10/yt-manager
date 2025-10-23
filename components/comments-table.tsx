"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, ExternalLink, TrendingUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ReplyDialog } from "@/components/reply-dialog"
import { CommentsFilter } from "@/components/comments-filter"

// Mock data based on the MVP spec
const mockComments = [
  {
    id: "1",
    author: "TechEnthusiast42",
    authorAvatar: "/abstract-geometric-shapes.png",
    text: "This tutorial was amazing! Could you make a follow-up video about advanced techniques?",
    videoTitle: "Getting Started with Next.js 15",
    likes: 234,
    isQuestion: true,
    priorityScore: 334,
    timestamp: "2 hours ago",
    replied: false,
  },
  {
    id: "2",
    author: "CodeMaster99",
    authorAvatar: "/abstract-geometric-shapes.png",
    text: "What's the difference between server and client components? I'm still confused about when to use each.",
    videoTitle: "React Server Components Explained",
    likes: 189,
    isQuestion: true,
    priorityScore: 289,
    timestamp: "5 hours ago",
    replied: false,
  },
  {
    id: "3",
    author: "WebDevJourney",
    authorAvatar: "/diverse-group-collaborating.png",
    text: "Great content as always! Keep up the excellent work.",
    videoTitle: "Getting Started with Next.js 15",
    likes: 156,
    isQuestion: false,
    priorityScore: 156,
    timestamp: "1 day ago",
    replied: true,
  },
  {
    id: "4",
    author: "LearnToCode2024",
    authorAvatar: "/abstract-geometric-shapes.png",
    text: "How do you handle authentication in production? Would love to see a video on that!",
    videoTitle: "Building a Full-Stack App",
    likes: 312,
    isQuestion: true,
    priorityScore: 412,
    timestamp: "3 hours ago",
    replied: false,
  },
  {
    id: "5",
    author: "DevNewbie",
    authorAvatar: "/abstract-geometric-shapes.png",
    text: "Thanks for explaining this so clearly! Finally understand the concept.",
    videoTitle: "React Server Components Explained",
    likes: 87,
    isQuestion: false,
    priorityScore: 87,
    timestamp: "6 hours ago",
    replied: true,
  },
]

type FilterType = "all" | "questions" | "unreplied" | "high-priority"
type SortType = "priority" | "recent" | "likes"

interface CommentsTableProps {
  initialFilter?: FilterType
}

export function CommentsTable({ initialFilter = "all" }: CommentsTableProps) {
  const [comments] = useState(mockComments)
  const [selectedComment, setSelectedComment] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>(initialFilter)
  const [sort, setSort] = useState<SortType>("priority")

  useEffect(() => {
    const handleFilterHighPriority = () => {
      setFilter("high-priority")
    }

    window.addEventListener("filterHighPriority", handleFilterHighPriority)
    return () => window.removeEventListener("filterHighPriority", handleFilterHighPriority)
  }, [])

  const handleCloseReply = () => {
    setSelectedComment(null)
  }

  const handleReplySubmit = (commentId: string, reply: string) => {
    console.log("[v0] Reply submitted:", { commentId, reply })
    // In production, this would call the YouTube API
    setSelectedComment(null)
  }

  const filteredComments = comments.filter((comment) => {
    if (filter === "questions") return comment.isQuestion
    if (filter === "unreplied") return !comment.replied
    if (filter === "high-priority") return comment.priorityScore > 300
    return true
  })

  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sort === "priority") return b.priorityScore - a.priorityScore
    if (sort === "likes") return b.likes - a.likes
    // For "recent", we'd need actual timestamps, but for now use priority as fallback
    return b.priorityScore - a.priorityScore
  })

  return (
    <>
      <Card className="border-2 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Recent Comments</CardTitle>
              <CardDescription className="text-base">Prioritized by engagement and question detection</CardDescription>
            </div>
            <CommentsFilter filter={filter} sort={sort} onFilterChange={setFilter} onSortChange={setSort} />
          </div>
        </CardHeader>
        <CardContent>
          {filteredComments.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                <MessageSquare className="h-12 w-12 opacity-50" />
              </div>
              <p className="text-lg font-medium">No comments match your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-4 p-5 rounded-xl border-2 bg-card hover:bg-accent/30 hover:border-red-200 dark:hover:border-red-900 transition-all duration-200 hover:shadow-md"
                >
                  <Avatar className="h-12 w-12 border-2">
                    <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} alt={comment.author} />
                    <AvatarFallback className="font-semibold">{comment.author[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base">{comment.author}</span>
                          <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                          {comment.isQuestion && (
                            <Badge
                              variant="secondary"
                              className="text-xs font-semibold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900"
                            >
                              Question
                            </Badge>
                          )}
                          {comment.replied && (
                            <Badge
                              variant="outline"
                              className="text-xs font-semibold border-green-200 dark:border-green-900 text-green-700 dark:text-green-400"
                            >
                              Replied
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{comment.videoTitle}</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                        <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-500" />
                        <span className="text-sm font-bold text-red-600 dark:text-red-500">
                          {comment.priorityScore}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-pretty leading-relaxed">{comment.text}</p>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{comment.likes}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
                        onClick={() => setSelectedComment(comment.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 font-semibold">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on YouTube
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedComment && (
        <ReplyDialog
          comment={comments.find((c) => c.id === selectedComment)!}
          onClose={handleCloseReply}
          onSubmit={handleReplySubmit}
        />
      )}
    </>
  )
}
