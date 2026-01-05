"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { 
  Copy, Check, RotateCcw, MessageSquare, 
  Lightbulb, TrendingUp, Users, ArrowRight 
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

interface ResultsData {
  topQuestions: Array<{
    id: string;
    label: string;
    commentCount: number;
    examples: string[];
    representativeComment?: string;
  }>;
  videoIdeas: Array<{
    title: string;
    relatedTopic: string;
  }>;
  pdfUrl?: string;
  channel: {
    name: string;
    subscriberCount: number;
    thumbnailUrl?: string;
  }
}

export default function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobId = searchParams.get("jobId")
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: {user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect back to preview if they aren't logged in
        router.push(`/preview?jobId=${jobId}`)
        return
      }

      // User is signed in, fetch their results
      fetch(`/api/results/${jobId}`)
    }
    checkUser()
  }, [jobId])

  useEffect(() => {
    if (!jobId) return
    fetch(`/api/results/${jobId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId])

  const newAnalysis = () => {
    // send them back to the start.
    router.push('/')
  }

  if (loading) return (
    <div className="p-20 text-center">
      <Skeleton className="h-150 w-full max-w-4xl mx-auto rounded-xl" />
    </div>
  )
  
  if (!data) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-muted-foreground">We couldn't find analysis for this ID. Please try again.</p>
      </Card>
    </div>
  )

  const totalComments = data.topQuestions.reduce((acc, q) => acc + q.commentCount, 0)

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <nav className="border-b bg-white sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
            {data.channel.name.substring(0,1)}
          </div>
          <div>
            <h1 className="font-semibold text-lg">{data.channel.name}</h1>
            <p className="text-xs text-muted-foreground">Analysis Report</p>
          </div>
        </div>
        <Button onClick={newAnalysis} disabled={!data.pdfUrl} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" /> New Analysis
        </Button>
      </nav>

      <div className="container mx-auto max-w-6xl p-6 space-y-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
            label="Comments Analyzed"
            value={totalComments > 0 ? totalComments.toLocaleString() : "1,000+"}
          />
          <StatsCard 
            icon={<Lightbulb className="w-5 h-5 text-amber-500" />}
            label="Themes Found"
            value={data.topQuestions.length.toString()}
          />
          <StatsCard 
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            label="Action Items"
            value={data.videoIdeas.length.toString()}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-100 bg-slate-100/80">
            <TabsTrigger value="insights">Themes & Insights</TabsTrigger>
            <TabsTrigger value="ideas">Video Ideas</TabsTrigger>
          </TabsList>

          {/* TAB 1: THEMES */}
          <TabsContent value="insights" className="mt-6 space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight">Community Themes</h2>
              <p className="text-muted-foreground">The main patterns detected in your comment section.</p>
            </div>
            
            <div className="grid gap-6">
              {data.topQuestions.map((topic, i) => (
                <Card key={i} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-slate-50/50 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-white">Theme #{i + 1}</Badge>
                        <CardTitle className="text-xl">{topic.label}</CardTitle>
                      </div>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                        High Signal
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Representative Comment:</h4>
                      <div className="bg-slate-50 p-4 rounded-lg text-sm italic text-slate-700 border border-slate-100 leading-relaxed">
                        "{topic.representativeComment || topic.examples[0] || "No text available"}"
                      </div>
                    </div>
                    <div className="flex flex-col justify-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Insight
                      </h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        This theme appeared frequently. Users are discussing <strong>{topic.label}</strong>. 
                        Consider addressing this in a future video or pinned comment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: IDEAS */}
          <TabsContent value="ideas" className="mt-6">
             <div className="grid md:grid-cols-2 gap-6">
              {data.videoIdeas.map((idea, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">Based on: {idea.relatedTopic}</Badge>
                    <CardTitle className="text-lg text-balance leading-relaxed">
                      {idea.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatsCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-slate-100 rounded-full">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}