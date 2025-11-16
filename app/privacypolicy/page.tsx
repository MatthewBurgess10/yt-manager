import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-red-50/30 dark:to-red-950/10">
        {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/replyyt_icon_new.png" alt="ReplyYT Logo" width={120} height={120}/>
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: March 2025
            </p>
          </header>

          <section className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              ReplyYT (“we”, “our”, or “us”) provides tools that help users filter,
              analyze, and view AI suggestions for YouTube comments. This Privacy Policy
              explains how we collect, use, store, and protect your data.
            </p>

            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">A. Google Account Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you sign in using Google OAuth, we collect your <strong>name</strong> and
                <strong> email address</strong>. These are stored securely in our database
                (Supabase) to identify your account.
              </p>

              <h3 className="text-xl font-semibold">B. YouTube Data (Not Stored)</h3>
              <p className="text-muted-foreground leading-relaxed">
                ReplyYT temporarily accesses YouTube comment data and metadata only to
                display it to you and provide AI suggestions.{" "}
                <strong>We do not store any YouTube data.</strong>
              </p>

              <h3 className="text-xl font-semibold">C. Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use <strong>Simple Analytics</strong>, a privacy-first analytics tool that
                collects <strong>no personal data</strong> and uses no cookies.
              </p>

              <h3 className="text-xl font-semibold">D. Third-Party Services</h3>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed">
                <li>Supabase — secure database for storing name + email</li>
                <li>BoostToad — feedback/widget integration</li>
                <li>Simple Analytics — privacy-focused analytics</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your data to authenticate your account, display your YouTube comments
              (not stored), and generate AI-based suggestions. We never sell your data.
            </p>

            <h2 className="text-2xl font-semibold">3. Google API Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              ReplyYT’s use of Google APIs follows the{" "}
              <strong>Google API Services User Data Policy</strong> including Limited Use
              requirements.
            </p>

            <h2 className="text-2xl font-semibold">4. Data Storage & Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We store only your name and email. YouTube data is never stored. All data is
              protected through access control, encrypted connections, and secure storage.
            </p>

            <h2 className="text-2xl font-semibold">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Name + email are stored until you request deletion. YouTube data is never
              persisted.
            </p>

            <h2 className="text-2xl font-semibold">6. Data Deletion</h2>
            <p className="text-muted-foreground leading-relaxed">
              To delete your account and all stored data, email:
              <br />
              <strong>burgessmatthew002@gmail.com</strong>
            </p>

            <h2 className="text-2xl font-semibold">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any privacy-related questions, contact us at:
              <br />
              <strong>burgessmatthew002@gmail.com</strong>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
