import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function TermsOfService() {
  return (
    
    <div className="min-h-screen bg-linear-to-br from-background via-background to-red-50/30 dark:to-red-950/10">
        {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/replyyt_icon_new.png" alt="ReplyYT Logo" width={120} height={120} />
            {/* <span className="font-bold text-xl bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              ReplyYT
            </span> */}
          </div>
          <Link href="/login">
            <Button size="lg" className="shadow-lg shadow-red-600/20">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>
      <main className="container mx-auto px-4 lg:px-8 py-16">
        
        <div className="max-w-4xl mx-auto space-y-12 bg-card border rounded-2xl p-10 shadow-sm">
          
          <header className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-balance">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: March 2025
            </p>
          </header>

          <section className="space-y-6">

            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using ReplyYT, you agree to these Terms of Service. If you do not agree,
              please stop using the service.
            </p>

            <h2 className="text-2xl font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ReplyYT provides AI-powered filtering, analysis, and reply tools for YouTube
              comments. ReplyYT is not affiliated with Google or YouTube.
            </p>

            <h2 className="text-2xl font-semibold">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-muted-foreground leading-relaxed">
              <li>Do not misuse or abuse YouTube APIs.</li>
              <li>Do not violate YouTube’s Terms of Service.</li>
              <li>Do not use ReplyYT for spam or automated mass replies.</li>
              <li>Do not reverse engineer or tamper with the platform.</li>
            </ul>

            <h2 className="text-2xl font-semibold">4. Account Requirements</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users must authenticate using Google OAuth and must provide accurate
              information.
            </p>

            <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              ReplyYT is provided “as-is.” We are not responsible for outages, errors, AI
              behavior, misuse, or consequences resulting from interactions with YouTube
              systems or APIs.
            </p>

            <h2 className="text-2xl font-semibold">6. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate accounts that violate these terms or misuse
              platform features.
            </p>

            <h2 className="text-2xl font-semibold">7. Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms at any time. Continued use signifies acceptance of
              changes.
            </p>

            <h2 className="text-2xl font-semibold">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any legal or support inquiries, contact:
              <br />
              <strong>burgessmatthew002@gmail.com</strong>
            </p>

          </section>
        </div>
      </main>
    </div>
  );
}
