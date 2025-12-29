"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Define types for the API response
interface PreviewData {
  topQuestions: Array<{
    label: string;
    commentCount: number;
    examples: string[];
  }>;
  videoIdeas: Array<{
    title: string;
    relatedTopic: string;
  }>;
}

export default function PreviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const channel = searchParams.get("channel") || "@yourchannel"
  const jobId = searchParams.get("jobId")

  const [data, setData] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!jobId) return

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/results/${jobId}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (error) {
        console.error("Failed to fetch preview", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [jobId])

  const handleSaveReport = () => {
    // Pass the jobId to the save page so we can retrieve it later
    router.push(`/save?channel=${encodeURIComponent(channel)}&jobId=${jobId}`)
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-white container mx-auto px-4 py-16 max-w-4xl space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Fallback if data failed to load
  if (!data) return <div>Error loading results. Please try again.</div>

return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border sticky top-0 bg-white z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg" />
            <span className="text-xl font-semibold text-foreground">Replyt</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
              Audience Insights for: {channel}
            </h1>
            <p className="text-xl text-muted-foreground">Here's a preview of your audience analysis</p>
          </div>

          <Card className="p-8 space-y-6 bg-white border border-border shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">Top Questions (Preview)</h2>
            <div className="space-y-6">
              {/* Map over the first 2 questions from API */}
              {data.topQuestions.slice(0, 2).map((q, i) => (
                <div key={i} className="space-y-3 pb-6 border-b border-border last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground mb-2">"{q.label}"</h3>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {q.commentCount} comments
                      </span>
                    </div>
                  </div>
                  {/* Show first example if available */}
                  {q.examples[0] && (
                    <Card className="ml-10 p-4 bg-secondary/30 border-0">
                      <p className="text-sm text-muted-foreground italic">
                        "{q.examples[0]}"
                      </p>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 space-y-6 bg-white border border-border shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">Video Ideas (Preview)</h2>
            <ul className="space-y-4">
              {/* Map over first 3 video ideas */}
              {data.videoIdeas.slice(0, 3).map((idea, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-sm">→</span>
                  </div>
                  <span className="text-lg text-foreground font-medium">{idea.title}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-10 bg-secondary/30 border-2 border-dashed border-border">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">Full Report Available</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Unlock complete audience insights, video ideas, and ready-to-use reply templates
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left text-sm">
                <div className="flex items-center gap-2 text-foreground">✓ {data.topQuestions.length - 2} more audience questions</div>
                <div className="flex items-center gap-2 text-foreground">✓ {data.videoIdeas.length - 3} additional video ideas</div>
                <div className="flex items-center gap-2 text-foreground">✓ Suggested pinned replies</div>
                <div className="flex items-center gap-2 text-foreground">✓ High-impact comments</div>
                <div className="flex items-center gap-2 text-foreground">✓ Downloadable PDF report</div>
              </div>
              <Button onClick={handleSaveReport} size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                Save your full report
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}