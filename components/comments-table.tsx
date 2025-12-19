"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, ExternalLink, TrendingUp, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ReplyDialog } from "@/components/reply-dialog"
import { CommentsFilter } from "@/components/comments-filter"
import { useCommentsContext } from "@/context/CommentsContext";
import { set } from "date-fns"
import type { Comment } from "@/types/comment"






type FilterType = "all" | "questions" | "unreplied" | "high-priority"
type SortType = "priority" | "recent" | "likes"

interface CommentsTableProps {
  initialFilter?: FilterType
  onCommentsLoaded?: (comments: Comment[]) => void
  channelId?: string | null
}

export function CommentsTable({ initialFilter = "all", onCommentsLoaded, channelId }: CommentsTableProps) {
  const [comments, setLocalComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedComment, setSelectedComment] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>(initialFilter)
  const [sort, setSort] = useState<SortType>("priority")
  const [highPriorityThreshold, setHighPriorityThreshold] = useState(300)
  const { setComments, setOverallSentiment } = useCommentsContext();




  useEffect(() => {
    console.log("[v0] CommentsTable received channelId:", channelId)
    if (channelId) {
      fetchComments()
    } else {
      console.log("[v0] No channelId provided, waiting...")
      setLoading(false)
    }
  }, [channelId])

  const fetchComments = async () => {
    if (!channelId) {
      console.log("[v0] Cannot fetch comments: no channelId")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching comments for channelId:", channelId)
      const response = await fetch(`/api/youtube/comments?channelId=${channelId}`)
      const data = await response.json()

      console.log("[v0] Comments API response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch comments")
      }
      
      const fetchedComments = data.comments || []
      if (data.channelProfile?.highPriorityThreshold) {
        setHighPriorityThreshold(data.channelProfile.highPriorityThreshold)
        console.log("[v0] High priority threshold set to:", data.channelProfile.highPriorityThreshold)
      }
      console.log("[v0] Setting", fetchedComments.length, "comments in state")
      //set as a local variable
      setLocalComments(fetchedComments);
      //set comments into context
      setComments(fetchedComments);


      if (onCommentsLoaded) {
        console.log("[v0] Calling onCommentsLoaded with", fetchedComments.length, "comments")
        onCommentsLoaded(fetchedComments)
      }
      if (data.overallSentiment) {
        console.log("[v0] Received overall sentiment:", data.overallSentiment)
      }
    } catch (err: any) {
      console.error("[v0] Error fetching comments:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  //handle high priority filter event
  useEffect(() => {
    const handleFilterHighPriority = () => {
      setFilter("high-priority") // change filter to high-priority
    }

    window.addEventListener("filterHighPriority", handleFilterHighPriority)
    return () => window.removeEventListener("filterHighPriority", handleFilterHighPriority)
  }, [])

  //handle all comments filter event
  useEffect(() => {
    const handleFilterAllComments = () => {
      setFilter("all") // change filter to all
    }

    window.addEventListener("filterAllComments", handleFilterAllComments)
    return () => window.removeEventListener("filterAllComments", handleFilterAllComments)
  }, [])

  //handle all questions filter event
  useEffect(() => {
    const handleFilterAllQuestions = () => {
      setFilter("questions") // change filter to questions
    }

    window.addEventListener("filterAllQuestions", handleFilterAllQuestions)
    return () => window.removeEventListener("filterAllQuestions", handleFilterAllQuestions)
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
    if (filter === "high-priority") return comment.likes >= highPriorityThreshold
    return true
  })

  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sort === "priority") return b.priorityScore - a.priorityScore
    if (sort === "likes") return b.likes - a.likes
    // For "recent", we'd need actual timestamps, but for now use priority as fallback
    return b.priorityScore - a.priorityScore
  })

  if (!channelId) {
    return (
      <Card className="border-2 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
          <p className="text-lg font-semibold text-muted-foreground">Select a YouTube channel to view comments</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="border-2 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">Loading comments...</p>
          <p className="text-sm text-muted-foreground mt-2">Fetching your YouTube comments</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 shadow-lg border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
        <CardContent className="py-16 text-center">
          <div className="p-4 bg-red-100 dark:bg-red-950/50 rounded-full w-fit mx-auto mb-4">
            <MessageSquare className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Failed to Load Comments</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
          <Button onClick={fetchComments} variant="outline" className="bg-transparent">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

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
                          {comment.likes >= highPriorityThreshold && (
                            <Badge
                              variant="secondary"
                              className="text-xs font-semibold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                            >
                              High Priority
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
                      <div className="flex flex-col items-end gap-1">
                        {comment.relativeScore && (
                          <div className="text-xs text-muted-foreground font-medium">{comment.relativeScore} avg</div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-bold">{comment.priorityScore}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-pretty leading-relaxed">{comment.text}</p>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{comment.likes}</span>
                      </div>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
                        onClick={() => setSelectedComment(comment.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reply
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 font-semibold"
                        onClick={() => {
                          const url = `https://www.youtube.com/watch?v=${comment.videoId}&lc=${comment.commentId}#${comment.commentId}`
                          window.open(url, "_blank")
                        }}
                      >
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
