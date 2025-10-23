"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Comment {
  id: string
  author: string
  authorAvatar: string
  text: string
  videoTitle: string
  likes: number
  isQuestion: boolean
  timestamp: string
}

interface ReplyDialogProps {
  comment: Comment
  onClose: () => void
  onSubmit: (commentId: string, reply: string) => void
}

export function ReplyDialog({ comment, onClose, onSubmit }: ReplyDialogProps) {
  const [reply, setReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reply.trim()) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSubmit(comment.id, reply)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reply to Comment</DialogTitle>
          <DialogDescription>Your reply will be posted publicly on YouTube</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} alt={comment.author} />
              <AvatarFallback>{comment.author[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{comment.author}</span>
                <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                {comment.isQuestion && (
                  <Badge variant="secondary" className="text-xs">
                    Question
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{comment.videoTitle}</p>
              <p className="text-sm">{comment.text}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reply" className="text-sm font-medium">
              Your Reply
            </label>
            <Textarea
              id="reply"
              placeholder="Write your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{reply.length} characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reply.trim() || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Posting..." : "Post Reply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
