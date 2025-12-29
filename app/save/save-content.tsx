"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function SaveContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const channel = searchParams.get("channel")
  const jobId = searchParams.get("jobId")

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate sending magic link
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to results (in real app, user would click magic link)
    router.push(`/results?channel=${encodeURIComponent(channel || "")}&jobId=${jobId}`)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 shadow-lg border border-border">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-foreground">Save your report</h1>
            <p className="text-muted-foreground">Enter your email to access your full audience insights</p>
          </div>

          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground">Full audience questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground">Suggested replies</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground">Downloadable PDF</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-white border-border"
            />
            <Button type="submit" size="lg" className="w-full h-12 bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Sending magic link..." : "Send magic link"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            No password required. We'll email you a secure link.
          </p>
        </div>
      </Card>
    </div>
  )
}
