import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

export function ReplytCTA() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center bg-white border border-border rounded-2xl p-10 md:p-16 shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-sm mb-6">
        <div className="flex items-center -space-x-2">
          <img
            className="w-7 h-7 rounded-full border-2 border-white"
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50&h=50&fit=crop"
            alt="Creator 1"
          />
          <img
            className="w-7 h-7 rounded-full border-2 border-white"
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50&h=50&fit=crop"
            alt="Creator 2"
          />
          <img
            className="w-7 h-7 rounded-full border-2 border-white"
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&h=50&fit=crop"
            alt="Creator 3"
          />
        </div>
        <p className="font-medium text-muted-foreground">Join 10,000+ creators analyzing their audience</p>
      </div>

      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
        Start understanding your audience today
      </h2>

      <p className="text-lg text-muted-foreground mb-8 max-w-2xl text-pretty leading-relaxed">
        Turn your YouTube comments into actionable insights. Find what your audience keeps asking and create content
        they actually want.
      </p>

      <form action="/analyze" method="GET" className="w-full max-w-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            name="channel"
            placeholder="https://youtube.com/@yourchannel"
            className="flex-1 h-12 text-base bg-white border-border"
            required
          />
          <Button type="submit" size="lg" className="h-12 px-6 bg-primary hover:bg-primary/90 group">
            Analyze Now
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">No credit card required • Free analysis • 2 minute setup</p>
      </form>
    </div>
  )
}
