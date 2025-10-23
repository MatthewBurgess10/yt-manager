import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Youtube, TrendingUp, MessageSquare, Zap, ArrowRight, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-50/30 dark:to-red-950/10">
      <nav className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Youtube className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              CommentIQ
            </span>
          </div>
          <Link href="/login">
            <Button size="lg" className="shadow-lg shadow-red-600/20">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 lg:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              AI-Powered Comment Management
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-tight">
              Never Miss an{" "}
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Important Comment
              </span>{" "}
              Again
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
              AI-powered comment management for YouTube creators. Prioritize questions, track engagement, and respond
              faster than ever before.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button
                size="lg"
                className="text-lg px-8 h-12 shadow-xl shadow-red-600/20 hover:shadow-2xl hover:shadow-red-600/30 transition-all"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 h-12 border-2 bg-transparent">
              Watch Demo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-20 text-left">
            <div className="group p-8 rounded-2xl border-2 bg-card hover:bg-accent/50 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 hover:shadow-xl">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="font-bold text-xl mb-3">Smart Ranking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comments automatically ranked by engagement and AI-powered question detection
              </p>
            </div>
            <div className="group p-8 rounded-2xl border-2 bg-card hover:bg-accent/50 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 hover:shadow-xl">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-7 w-7 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="font-bold text-xl mb-3">Quick Replies</h3>
              <p className="text-muted-foreground leading-relaxed">
                Respond directly from the dashboard without switching tabs or losing context
              </p>
            </div>
            <div className="group p-8 rounded-2xl border-2 bg-card hover:bg-accent/50 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 hover:shadow-xl">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="font-bold text-xl mb-3">Real-time Sync</h3>
              <p className="text-muted-foreground leading-relaxed">
                Stay updated with the latest comments across all your videos automatically
              </p>
            </div>
          </div>

          <div className="mt-20 pt-12 border-t">
            <p className="text-sm text-muted-foreground mb-6">Trusted by content creators</p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
