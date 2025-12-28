import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ReplytFeatures } from "@/components/replyt-features"
import { ReplytHowItWorks } from "@/components/replyt-how-it-works"
import { ReplytCTA } from "@/components/replyt-cta"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg" />
              <span className="text-xl font-semibold text-foreground">Replyt</span>
            </div>
            <div className="flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">
                How it works
              </Link>
              <Link href="#get-started">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground text-balance">
              The modern way to understand your YouTube audience
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto text-pretty">
              Turn comments into content ideas. Find what your audience keeps asking and what you should answer next.
            </p>
          </div>

          <form action="/analyze" method="GET" className="max-w-2xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="url"
                name="channel"
                placeholder="https://youtube.com/@yourchannel"
                className="flex-1 h-14 text-base bg-white border-border shadow-sm"
                required
              />
              <Button type="submit" size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90">
                Analyze Channel
              </Button>
            </div>
          </form>
        </div>
      </section>

      <ReplytFeatures />

      <ReplytHowItWorks />

      <section id="get-started" className="container mx-auto px-4 py-20">
        <ReplytCTA />
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">© 2025 Replyt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
