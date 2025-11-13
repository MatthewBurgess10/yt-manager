import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Youtube, TrendingUp, MessageSquare, Zap, ArrowRight, CheckCircle2, Sparkles, Target, Clock, Eye} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-red-50/30 dark:to-red-950/10">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Youtube className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              ReplyYT
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

      <main className="container mx-auto px-4 lg:px-8">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm font-medium">
                <Zap className="h-4 w-4" />
                AI-Powered Comment Management
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-tight">
                Never Miss an{" "}
                <span className="bg-linear-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  Important Comment
                </span>{" "}
                Again
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
                Cut through the noise and find the comments that actually matter — so you can engage, grow, and connect
                with your audience in minutes, not hours.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-lg px-8 h-12 shadow-xl shadow-red-600/20 hover:shadow-2xl hover:shadow-red-600/30 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {/* <Button size="lg" variant="outline" className="text-lg px-8 h-12 border-2 bg-transparent">
                See How It Works →
              </Button> */}
            </div>
          </div>
        </section>

        {/* Section 1: The Pain */}
        <section className="py-16 md:py-24 border-t">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-balance">
                  Your audience is talking. But you're missing the best conversations.
                </h2>
                <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
                  When hundreds (or thousands) of comments flood in, it's impossible to catch the gems — the genuine
                  questions, fan shoutouts, or opportunities to convert casual viewers into loyal fans.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg border bg-card">
                  <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-lg w-fit mb-4">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Spending hours scrolling</h3>
                  <p className="text-sm text-muted-foreground">
                    Your YouTube Studio becomes a time sink trying to find valuable comments
                  </p>
                </div>
                <div className="p-6 rounded-lg border bg-card">
                  <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-lg w-fit mb-4">
                    <Target className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Missing high-value comments</h3>
                  <p className="text-sm text-muted-foreground">
                    The questions and opportunities that deserve replies slip through the cracks
                  </p>
                </div>
                <div className="p-6 rounded-lg border bg-card">
                  <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-lg w-fit mb-4">
                    <Eye className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Feeling disconnected</h3>
                  <p className="text-sm text-muted-foreground">
                    Losing touch with the community that grows your channel
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: The Solution */}
        <section className="py-16 md:py-24 border-t">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-balance">
                  Meet ReplyYT — your AI comment assistant.
                </h2>
                <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
                  ReplyYT scans every comment on your channel, filters out spam and fluff, and highlights the ones{" "}
                  <em>worth your attention</em> — so you know exactly who to engage with.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg bg-linear-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Who to reply to first
                  </h3>
                  <p className="text-sm text-muted-foreground">AI identifies the highest priority comments instantly</p>
                </div>
                <div className="p-6 rounded-lg bg-linear-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Which questions need input
                  </h3>
                  <p className="text-sm text-muted-foreground">Never miss important questions from your viewers</p>
                </div>
                <div className="p-6 rounded-lg bg-linear-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    What feedback deserves action
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Surface constructive feedback that improves your content
                  </p>
                </div>
              </div>

              <p className="text-center text-lg font-medium text-foreground">
                No more guesswork. No more wasted time. Just smarter engagement.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Core Features */}
        <section className="py-16 md:py-24 border-t">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-balance">Core Features</h2>
              <p className="text-lg text-muted-foreground">Everything you need to master your comment section</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="group p-8 rounded-2xl border-2 bg-card hover:bg-accent/50 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 hover:shadow-xl">
                <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-7 w-7 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="font-bold text-xl mb-3">Smart Filtering and Ranking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI sorts comments by urgency, sentiment, and reply priority. High-priority comments are marked
                  instantly so you focus on what matters.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border-2 bg-card hover:bg-accent/50 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 hover:shadow-xl">
                <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="font-bold text-xl mb-3">Instant Insights</h3>
                <p className="text-muted-foreground leading-relaxed">
                  See at a glance which comments could boost community engagement or strengthen your brand reputation.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border-2 bg-card hover:bg-accent/50 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 hover:shadow-xl">
                <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-7 w-7 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="font-bold text-xl mb-3">Reply-Ready View</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Respond directly from the dashboard without switching tabs or losing context. Stay in the flow.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border-2 bg-card hover:bg-accent/50 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 hover:shadow-xl">
                <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="font-bold text-xl mb-3">Real-Time Sync</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Stay updated with the latest comments across all your videos automatically. Never fall behind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Emotional Copy */}
        <section className="py-16 md:py-24 border-t">
          <div className="max-w-3xl mx-auto text-center space-y-8 bg-linear-to-br from-red-50 to-transparent dark:from-red-950/20 dark:to-transparent p-12 rounded-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-balance">Turn overwhelmed into on top of it.</h2>
            <p className="text-lg md:text-xl text-muted-foreground text-balance leading-relaxed">
              You didn't become a creator to manage comment chaos — you're here to build connection and momentum.
            </p>
            <p className="text-lg md:text-xl text-foreground font-medium text-balance leading-relaxed">
              Let ReplyYT handle the filtering, so you can focus on what only <em>you</em> can do: creating and
              connecting.
            </p>
          </div>
        </section>

        {/* Section 5: Social Proof */}
        {/* <section className="py-16 md:py-24 border-t">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-balance">
                Trusted by creators who care about their audience.
              </h2>
              <p className="text-lg text-muted-foreground">
                From educators to entertainers, ReplyYT helps creators reply with purpose — not panic.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm italic text-muted-foreground mb-4">
                  "ReplyYT saved me hours every week. I'm actually engaging with my community again instead of drowning
                  in comments."
                </p>
                <p className="font-semibold text-sm">Coming Soon</p>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm italic text-muted-foreground mb-4">
                  "The AI is genuinely impressive at picking out questions and positive feedback. It's like having a
                  personal assistant."
                </p>
                <p className="font-semibold text-sm">Coming Soon</p>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm italic text-muted-foreground mb-4">
                  "Finally, a tool that gets it. My subscribers feel heard, and I feel less overwhelmed. This is a
                  game-changer."
                </p>
                <p className="font-semibold text-sm">Coming Soon</p>
              </div>
            </div>
          </div>
        </section> */}

        {/* Section 6: Final CTA */}
        <section className="py-16 md:py-24 border-t">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-balance">Reclaim your comment section today.</h2>
              <p className="text-xl text-muted-foreground text-balance">Stop scrolling. Start engaging.</p>
            </div>

            <Link href="/login">
              <Button
                size="lg"
                className="text-lg px-10 h-14 shadow-xl shadow-red-600/20 hover:shadow-2xl hover:shadow-red-600/30 transition-all"
              >
                🚀 Try ReplyYT Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <p className="text-sm text-muted-foreground">No credit card required.</p>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 md:py-16 border-t">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-muted-foreground text-center mb-8">Why creators love ReplyYT</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-sm">Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-sm">Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50 py-12 mt-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <Youtube className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg">ReplyYT</span>
              </div>
              <nav className="flex gap-8 text-sm">
                {/* <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Product
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link> */}

                {/* This needs to link the the Boost Toad popup */}
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
              </nav>
            </div>
            <div className="border-t pt-8">
              <p className="text-center text-sm text-muted-foreground">ReplyYT — Conversations that count.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
