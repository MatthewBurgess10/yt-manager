"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSearchParams, useRouter } from "next/navigation"

export default function PreviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const channel = searchParams.get("channel") || "@yourchannel"

  const handleSaveReport = () => {
    router.push(`/save?channel=${encodeURIComponent(channel)}`)
  }

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
              <div className="space-y-3 pb-6 border-b border-border">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-2">"Why does this fail at step 3?"</h3>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      24 comments
                    </span>
                  </div>
                </div>
                <Card className="ml-10 p-4 bg-secondary/30 border-0">
                  <p className="text-sm text-muted-foreground italic">
                    "I followed everything but it still doesn't work when I get to step 3. Any ideas?"
                  </p>
                </Card>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      "Can this be done without paid tools?"
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      18 comments
                    </span>
                  </div>
                </div>
                <Card className="ml-10 p-4 bg-secondary/30 border-0">
                  <p className="text-sm text-muted-foreground italic">
                    "Is there a free alternative? I can't afford the premium version right now."
                  </p>
                </Card>
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6 bg-white border border-border shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">Video Ideas (Preview)</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">→</span>
                </div>
                <span className="text-lg text-foreground font-medium">"Why beginners struggle with step 3"</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">→</span>
                </div>
                <span className="text-lg text-foreground font-medium">"Free alternatives to expensive tools"</span>
              </li>
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
                <div className="flex items-center gap-2 text-foreground">✓ 7 more audience questions</div>
                <div className="flex items-center gap-2 text-foreground">✓ 5 additional video ideas</div>
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
