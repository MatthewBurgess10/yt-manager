"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Copy, Check, Download, ChevronDown, ChevronUp } from "lucide-react"

export default function ResultsContent() {
  const searchParams = useSearchParams()
  const channel = searchParams.get("channel") || "@yourchannel"
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

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

  const questions = [
    {
      question: "Why does this fail at step 3?",
      count: 24,
      examples: [
        "I followed everything but it still doesn't work when I get to step 3. Any ideas?",
        "Step 3 keeps giving me an error. What am I doing wrong?",
        "The tutorial works until step 3, then it breaks. Help please!",
      ],
    },
    {
      question: "Can this be done without paid tools?",
      count: 18,
      examples: [
        "Is there a free alternative? I can't afford the premium version right now.",
        "Any way to do this without spending money?",
        "What's the cheapest way to accomplish this?",
      ],
    },
    {
      question: "Does this work on Windows?",
      count: 15,
      examples: [
        "I'm on Windows 11, will this still work?",
        "Any Windows users here? Does it work?",
        "Mac only or Windows compatible?",
      ],
    },
  ]

  const videoIdeas = [
    '"Why beginners struggle with step 3"',
    '"Free alternatives to expensive tools"',
    '"Complete Windows setup guide"',
    '"Common mistakes that break the workflow"',
    '"Budget-friendly options for getting started"',
  ]

  const highLeverageComments = [
    {
      comment: "Does this work on Windows? Mine keeps crashing at step 3.",
      likes: 43,
      replies: 12,
      suggestedReply:
        "Short answer: yes, but you need to install the Visual C++ Redistributable first. I'll pin a detailed Windows guide in the comments!",
    },
    {
      comment: "Is there a free version of this tool? Can't afford the paid one right now.",
      likes: 38,
      replies: 8,
      suggestedReply:
        "Check out [Tool Name] - it's free and covers 90% of what you need. I actually started with it before upgrading.",
    },
  ]

  const pinnedComment = `A lot of people are asking about Windows compatibility and free alternatives. 

Windows users: You'll need Visual C++ Redistributable installed first (link in description).

Free options: [Tool Name] is completely free and works great for beginners. I'll make a dedicated video on this next week!`

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border sticky top-0 bg-white z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg" />
              <span className="text-xl font-semibold text-foreground">Replyt</span>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Download PDF
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
            <p className="text-sm text-muted-foreground mb-2">Total questions</p>
            <p className="text-4xl font-bold text-foreground">10</p>
          </Card>
          <Card className="p-6 bg-white border border-border shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Video ideas generated</p>
            <p className="text-4xl font-bold text-foreground">5</p>
          </Card>
          <Card className="p-6 bg-white border border-border shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Comments analyzed</p>
            <p className="text-4xl font-bold text-foreground">247</p>
          </Card>
        </div>

        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Top Questions Your Audience Is Asking</h2>
            <p className="text-muted-foreground">Most frequently asked questions from your recent videos</p>
          </div>

          <div className="space-y-4">
            {questions.map((item, index) => (
              <Card key={index} className="p-6 space-y-4 bg-white border border-border shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl text-foreground mb-2">"{item.question}"</h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {item.count} comments
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

        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">High-Demand Video Ideas</h2>
            <p className="text-muted-foreground">Content opportunities based on audience questions</p>
          </div>

          <Card className="p-8 bg-white border border-border shadow-sm">
            <ul className="space-y-4">
              {videoIdeas.map((idea, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">→</span>
                  </div>
                  <span className="text-lg text-foreground font-medium">{idea}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Comments You Should Reply To</h2>
            <p className="text-muted-foreground">High-impact engagement opportunities</p>
          </div>

          <div className="space-y-6">
            {highLeverageComments.map((item, index) => (
              <Card key={index} className="p-6 space-y-4 bg-white border border-border shadow-sm">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Comment:</h3>
                    <p className="text-muted-foreground italic">"{item.comment}"</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Why it matters:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {item.likes} likes</li>
                      <li>• {item.replies} replies</li>
                      <li>• Repeated question</li>
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

        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Suggested Pinned Comment</h2>
            <p className="text-muted-foreground">Address multiple common questions at once</p>
          </div>

          <Card className="p-8 space-y-6 bg-white border border-border shadow-sm">
            <div className="bg-secondary/30 p-6 rounded-lg">
              <p className="text-foreground whitespace-pre-line leading-relaxed">{pinnedComment}</p>
            </div>
            <Button
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => copyToClipboard(pinnedComment, 999)}
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
      </div>
    </div>
  )
}
