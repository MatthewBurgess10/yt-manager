"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AnalyzePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const channelUrl = searchParams.get("channel")
  
  // State for job management
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("initializing")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  // Prevent double-firing in React Strict Mode
  const hasStartedRef = useRef(false)

  const steps = [
    "Finding your video",
    "Reading audience comments",
    "Identifying patterns",
    "Finalizing insights",
  ]

  // Step 1: Start the Analysis
  useEffect(() => {
    if (!channelUrl || hasStartedRef.current) return
    hasStartedRef.current = true

    const startAnalysis = async () => {
      try {
        const response = await fetch('/api/analyze-channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelUrl })
        })

        if (!response.ok) throw new Error('Failed to start analysis')
        
        const data = await response.json()
        setJobId(data.jobId)
        
        // If it's an existing complete job, jump to 100
        if (data.status === 'complete') {
          setProgress(100)
          setStatus('complete')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    startAnalysis()
  }, [channelUrl])

  // Step 2: Poll for Status
  useEffect(() => {
    if (!jobId || status === 'complete' || status === 'failed') return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/analysis-status/${jobId}`)
        const data = await response.json()

        if (response.ok) {
          setStatus(data.status)
          setProgress(data.progress)

          if (data.status === 'complete') {
            clearInterval(pollInterval)
            // Redirect to preview with the Job ID
            router.push(`/preview?jobId=${jobId}&channel=${encodeURIComponent(channelUrl || '')}`)
          } else if (data.status === 'failed') {
            setError(data.errorMessage || 'Analysis failed')
            clearInterval(pollInterval)
          }
        }
      } catch (e) {
        console.error("Polling error", e)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [jobId, status, router, channelUrl])

  // Determine active step based on progress percentage
  const currentStepIndex = Math.floor((progress / 100) * steps.length)

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-red-500 text-xl font-bold">Analysis Failed</div>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            {progress < 100 ? "Scanning your channel..." : "Analysis Complete!"}
          </h1>
          <p className="text-muted-foreground">{Math.round(progress)}% Complete</p>
        </div>

        <div className="space-y-3 text-left">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-500 ${
                  index <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {index <= currentStepIndex && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={index <= currentStepIndex ? "text-foreground font-medium" : "text-muted-foreground"}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}