"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Copy, Check, Download, ChevronDown, ChevronUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Define interfaces based on API response structure
interface ResultsData {
  topQuestions: Array<{
    id: string;
    label: string;
    commentCount: number;
    examples: string[];
  }>;
  videoIdeas: Array<{
    title: string;
    relatedTopic: string;
  }>;
  replyOpportunities: Array<{
    id: string;
    commentText: string;
    commentLikes: number;
    commentReplies: number;
    reason: string;
    suggestedReply: string;
  }>;
  pinnedComment: string | null;
  pdfUrl?: string;
  channel: {
    subscriberCount: number;
  }
}

export default function ResultsContent() {
  const searchParams = useSearchParams()
  const channel = searchParams.get("channel") || "@yourchannel"
  const jobId = searchParams.get("jobId")

  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  // Fetch Data
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
        console.error("Failed to fetch results", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [jobId])

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedQuestions(newExpanded)
  }

  const handleDownloadPdf = () => {
    if (data?.pdfUrl) {
      window.open(data.pdfUrl, '_blank')
    }
  }
  if (loading) {
     return (
       <div className="min-h-screen bg-white container mx-auto px-4 py-16 max-w-5xl space-y-8">
         <Skeleton className="h-16 w-1/2" />
         <div className="grid sm:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
         </div>
         <Skeleton className="h-96 w-full" />
       </div>
     )
  }

  if (!data) return <div>Error loading results.</div>

  // Calculate totals for stats cards
  const totalCommentsAnalyzed = data.topQuestions.reduce((acc, q) => acc + q.commentCount, 0)
  

return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border sticky top-0 bg-white z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg" />
              <span className="text-xl font-semibold text-foreground">Replyt</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-transparent"
              onClick={handleDownloadPdf}
              disabled={!data.pdfUrl}
            >
              <Download className="w-4 h-4" />
              {data.pdfUrl ? "Download PDF" : "Generating PDF..."}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-5xl space-y-16">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Audience Insights for: {channel}
          </h1>
          <p className="text-xl text-muted-foreground">Your complete audience analysis report</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border border-border shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Total questions found</p>
            <p className="text-4xl font-bold text-foreground">{data.topQuestions.length}</p>
          </Card>
          <Card className="p-6 bg-white border border-border shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Video ideas generated</p>
            <p className="text-4xl font-bold text-foreground">{data.videoIdeas.length}</p>
          </Card>
          <Card className="p-6 bg-white border border-border shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Relevant Comments</p>
            <p className="text-4xl font-bold text-foreground">{totalCommentsAnalyzed}</p>
          </Card>
        </div>

        {/* TOP QUESTIONS SECTION */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Top Questions Your Audience Is Asking</h2>
            <p className="text-muted-foreground">Most frequently asked questions from your recent videos</p>
          </div>

          <div className="space-y-4">
            {data.topQuestions.map((item, index) => (
              <Card key={index} className="p-6 space-y-4 bg-white border border-border shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl text-foreground mb-2">"{item.label}"</h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {item.commentCount} comments
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleQuestion(index)} className="gap-2">
                    {expandedQuestions.has(index) ? (
                      <>
                        Hide <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Examples <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {expandedQuestions.has(index) && (
                  <div className="pl-11 space-y-3">
                    {item.examples.map((example, exIndex) => (
                      <Card key={exIndex} className="p-4 bg-secondary/30 border-0">
                        <p className="text-sm text-muted-foreground italic">"{example}"</p>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* VIDEO IDEAS SECTION */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">High-Demand Video Ideas</h2>
            <p className="text-muted-foreground">Content opportunities based on audience questions</p>
          </div>

          <Card className="p-8 bg-white border border-border shadow-sm">
            <ul className="space-y-4">
              {data.videoIdeas.map((idea, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-sm">→</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg text-foreground font-medium">{idea.title}</span>
                    <span className="text-sm text-muted-foreground">Based on topic: {idea.relatedTopic}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* REPLY OPPORTUNITIES SECTION */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Comments You Should Reply To</h2>
            <p className="text-muted-foreground">High-impact engagement opportunities</p>
          </div>

          <div className="space-y-6">
            {data.replyOpportunities.map((item, index) => (
              <Card key={index} className="p-6 space-y-4 bg-white border border-border shadow-sm">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Comment:</h3>
                    <p className="text-muted-foreground italic">"{item.commentText}"</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Why it matters:</h4>
                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                      {/* Note: The API might return nulls for likes if not processed, default to 0 */}
                      <li>• {item.commentLikes || 0} likes</li>
                      <li>• {item.commentReplies || 0} replies</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-2">Suggested reply:</h4>
                    <div className="bg-secondary/30 p-4 rounded-lg space-y-3">
                      <p className="text-sm text-foreground">{item.suggestedReply}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                        onClick={() => copyToClipboard(item.suggestedReply, index)}
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* PINNED COMMENT SECTION */}
        {data.pinnedComment && (
          <section className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Suggested Pinned Comment</h2>
              <p className="text-muted-foreground">Address multiple common questions at once</p>
            </div>

            <Card className="p-8 space-y-6 bg-white border border-border shadow-sm">
              <div className="bg-secondary/30 p-6 rounded-lg">
                <p className="text-foreground whitespace-pre-line leading-relaxed">{data.pinnedComment}</p>
              </div>
              <Button
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={() => copyToClipboard(data.pinnedComment!, 999)}
              >
                {copiedIndex === 999 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy pinned comment
                  </>
                )}
              </Button>
            </Card>
          </section>
        )}
      </div>
    </div>
  )
}