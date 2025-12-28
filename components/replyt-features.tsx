import { Check } from "lucide-react"
import { Badge } from "@/components/badge"

export function ReplytFeatures() {
  return (
    <div className="w-full py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 flex-col items-start max-w-4xl mx-auto">
          <div>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
              Features
            </Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-4xl md:text-5xl tracking-tight font-bold text-foreground">
              Everything you need to understand your audience
            </h2>
            <p className="text-lg max-w-3xl leading-relaxed tracking-tight text-muted-foreground">
              Built for creators who want to create content that resonates
            </p>
          </div>
          <div className="flex gap-10 pt-12 flex-col w-full">
            <div className="grid grid-cols-1 items-start lg:grid-cols-3 gap-8 md:gap-10">
              <div className="flex flex-row gap-4 w-full items-start">
                <Check className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-foreground">Clear, real-time insights</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    See the most frequently asked questions from your audience across all your videos.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-4 items-start">
                <Check className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-foreground">Data-backed video ideas</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Get video topic suggestions based on what your audience actually wants to see.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-4 items-start">
                <Check className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-foreground">Copy-paste ready replies</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Save hours on community management with pre-written responses to high-impact comments.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-4 w-full items-start">
                <Check className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-foreground">Full control at your fingertips</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Identify which comments deserve your attention based on engagement and reach.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-4 items-start">
                <Check className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-foreground">Pinned comment templates</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Ready-to-use pinned comments that address multiple audience questions at once.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-4 items-start">
                <Check className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-foreground">Exportable PDF reports</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Download your complete audience report as a beautifully formatted PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
