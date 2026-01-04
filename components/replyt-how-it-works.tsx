"use client"

import { cn } from "@/lib/utils"
import { Search, Sparkles, FileCheck } from "lucide-react"
import type React from "react"

interface StepCardProps {
  icon: React.ReactNode
  title: string
  description: string
  benefits: string[]
}

const StepCard: React.FC<StepCardProps> = ({ icon, title, description, benefits }) => (
  <div
    className={cn(
      "relative rounded-xl border border-border bg-white p-8 text-card-foreground transition-all duration-200",
      "hover:shadow-md",
    )}
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
    <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
    <p className="mb-6 text-muted-foreground leading-relaxed">{description}</p>
    <ul className="space-y-3">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-center gap-3">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
          </div>
          <span className="text-sm text-muted-foreground">{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
)

export const ReplytHowItWorks: React.FC = () => {
  const stepsData = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Enter your channel",
      description: "Paste your YouTube channel URL and let us analyze your audience's comments and questions.",
      benefits: ["Works with any YouTube channel", "Analyzes across all your videos", "Takes just seconds to start"],
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "We scan & analyze",
      description:
        "Our AI reads through your comments to find patterns, repeated questions, and engagement opportunities.",
      benefits: ["Identifies frequently asked questions", "Finds trending topics", "Prioritizes high-impact comments"],
    },
    {
      icon: <FileCheck className="h-6 w-6" />,
      title: "Get actionable insights",
      description: "Receive video ideas, suggested replies, and a complete PDF report you can use immediately.",
      benefits: ["Data-backed video ideas", "Copy-ready comment responses", "Downloadable PDF report"],
    },
  ]

  return (
    <section id="how-it-works" className="w-full bg-white py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">How it works</h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            From channel URL to actionable insights in minutes
          </p>
        </div>

        <div className="relative mx-auto mb-8 w-full max-w-5xl">
          <div
            aria-hidden="true"
            className="absolute left-[16.6667%] top-1/2 h-0.5 w-[66.6667%] -translate-y-1/2 bg-border hidden md:block"
          ></div>
          <div className="relative grid grid-cols-3">
            {stepsData.map((_, index) => (
              <div
                key={index}
                className="flex h-10 w-10 items-center justify-center justify-self-center rounded-full bg-primary font-semibold text-white shadow-sm ring-4 ring-background"
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {stepsData.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              benefits={step.benefits}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
