"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AnalyzePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const channel = searchParams.get("channel")

  const [progress, setProgress] = useState(0)
  const steps = [
    "Fetching recent videos",
    "Reading audience comments",
    "Finding repeated questions",
    "Ranking by demand",
  ]

  useEffect(() => {
    if (!channel) {
      router.push("/")
      return
    }

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 3) {
          clearInterval(interval)
          // Redirect to preview after completion
          setTimeout(() => {
            router.push(`/preview?channel=${encodeURIComponent(channel)}`)
          }, 500)
          return 3
        }
        return prev + 1
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [channel, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Scanning your channel…</h1>
        </div>

        <div className="space-y-3 text-left">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  index <= progress ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {index <= progress && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={index <= progress ? "text-foreground" : "text-muted-foreground"}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
