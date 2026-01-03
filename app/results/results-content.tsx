"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { 
  Copy, Check, Download, MessageSquare, 
  Lightbulb, TrendingUp, Users, ArrowRight 
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
    commentAuthor: string;
    reason: string;
    suggestedReply: string;
  }>;
  pinnedComment: string | null;
  pdfUrl?: string;
  channel: {
    name: string;
    subscriberCount: number;
    thumbnailUrl?: string;
  }
}

export default function ResultsContent() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("jobId")
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!jobId) return
    fetch(`/api/results/${jobId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId])

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleDownloadPdf = () => {
    if (data?.pdfUrl) window.open(data.pdfUrl, '_blank')
  }

  if (loading) return (
    <div className="p-20 text-center">
      <Skeleton className="h-[600px] w-full max-w-4xl mx-auto rounded-xl" />
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
        <Button onClick={handleDownloadPdf} disabled={!data.pdfUrl} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export PDF
        </Button>
      </nav>

      <div className="container mx-auto max-w-6xl p-6 space-y-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
            label="Analyzed Comments"
            value={totalComments.toLocaleString()}
          />
          <StatsCard 
            icon={<Lightbulb className="w-5 h-5 text-amber-500" />}
            label="Themes Identified"
            value={data.topQuestions.length.toString()}
          />
          <StatsCard 
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            label="Video Opportunities"
            value={data.videoIdeas.length.toString()}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[450px] bg-slate-100/80">
            <TabsTrigger value="insights">Themes & Insights</TabsTrigger>
            <TabsTrigger value="ideas">Video Ideas</TabsTrigger>
            <TabsTrigger value="replies">Reply Tools</TabsTrigger>
          </TabsList>

          {/* TAB 1: THEMES */}
          <TabsContent value="insights" className="mt-6 space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight">What your audience is saying</h2>
              <p className="text-muted-foreground">The most frequent questions and patterns found in your comment section.</p>
            </div>
            
            <div className="grid gap-6">
              {data.topQuestions.map((topic, i) => (
                <Card key={i} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-slate-50/50 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="secondary" className="mb-2">Topic #{i + 1}</Badge>
                        <CardTitle className="text-xl">{topic.label}</CardTitle>
                      </div>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                        {topic.commentCount} mentions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Example Comments:</h4>
                      <div className="space-y-3">
                        {topic.examples.slice(0, 2).map((ex, j) => (
                          <div key={j} className="bg-slate-50 p-3 rounded-lg text-sm italic text-slate-700 border border-slate-100">
                            "{ex}"
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Creator Insight
                      </h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        This topic has high engagement. Consider addressing "{topic.label}" in the first 60 seconds of your next video to increase viewer retention.
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
                    <Badge variant="outline" className="w-fit mb-2">Source: {idea.relatedTopic}</Badge>
                    <CardTitle className="text-lg text-balance leading-relaxed">
                      {idea.title}
                    </CardTitle>
                  </CardHeader>
                  {/* <CardContent>
                    <div className="flex justify-end">
                      <Button variant="ghost" className="text-primary group">
                        Create Outline <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent> */}
                </Card>
              ))}
             </div>
          </TabsContent>

          {/* TAB 3: REPLIES */}
          <TabsContent value="replies" className="mt-6 space-y-8">
            {/* Pinned Comment Section */}
            {data.pinnedComment && (
              <Card className="bg-linear-to-r from-indigo-50 to-purple-50 border-indigo-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-900">
                     <Users className="w-5 h-5" /> Recommended Community Post / Pinned Comment
                  </CardTitle>
                  <CardDescription className="text-indigo-700">
                    Scale your engagement by answering the collective audience in one place.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm relative group">
                    <p className="whitespace-pre-wrap text-slate-800 text-sm leading-relaxed">{data.pinnedComment}</p>
                    <Button 
                      size="sm" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(data.pinnedComment!, 999)}
                    >
                      {copiedIndex === 999 ? <Check className="w-4 h-4 mr-1"/> : <Copy className="w-4 h-4 mr-1"/>}
                      {copiedIndex === 999 ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> 
                Individual Reply Opportunities
              </h3>
              {data.replyOpportunities.map((opp, i) => (
                <Card key={i} className="border-slate-200">
                  <CardContent className="p-6 grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 space-y-3">
                      <div className="flex items-center gap-2">
                         <div className="font-semibold text-sm">{opp.commentAuthor || 'Viewer'}</div>
                         <Badge variant="secondary" className="text-[10px] uppercase">{opp.commentLikes || 0} likes</Badge>
                      </div>
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border italic">
                        "{opp.commentText}"
                      </div>
                      <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {opp.reason}
                      </p>
                    </div>
                    
                    <div className="md:col-span-1 flex items-center justify-center text-slate-300">
                      <ArrowRight className="hidden md:block w-6 h-6" />
                    </div>

                    <div className="md:col-span-6 flex flex-col justify-between bg-blue-50/30 p-4 rounded-lg border border-blue-100">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 block">AI Suggested Response</span>
                        <p className="text-sm text-slate-800 leading-relaxed">{opp.suggestedReply}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                         <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => copyToClipboard(opp.suggestedReply, i)}
                            className="gap-2"
                         >
                            {copiedIndex === i ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                            {copiedIndex === i ? "Copied" : "Copy Text"}
                         </Button>
                      </div>
                    </div>
                  </CardContent>
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