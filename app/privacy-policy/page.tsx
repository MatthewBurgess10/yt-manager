import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-red-50/30 dark:to-red-950/10">
        {/* Navigation - kept as is */}
      <nav className="border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/replyyt_icon_new.png" alt="ReplyYT Logo" width={120} height={120}/>
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
              ReplyYT Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: **November 2025**
            </p>
          </header>

          <section className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              ReplyYT (“we”, “our”, or “us”) provides tools that help YouTube Channel owners 
              filter, analyze, and view AI suggestions for their YouTube comments. This Privacy Policy
              explains how we collect, use, store, and protect your data, **specifically detailing 
              our practices concerning Google User Data in compliance with the Google API Services User Data Policy.**
            </p>

            <h2 className="text-2xl font-semibold">1. Information We Collect and Access (Data Accessed)</h2>

            <div className="space-y-4">
              
              <h3 className="text-xl font-semibold">A. Google Account Information (Stored)</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you sign in using Google OAuth, we collect your <strong>name</strong> and
                <strong> email address</strong>. These are stored securely in our database
                (Supabase) to identify your account and personalize your experience.
              </p>

              <h3 className="text-xl font-semibold">B. YouTube Data (Accessed, Not Stored)</h3>
              <p className="text-muted-foreground leading-relaxed">
                ReplyYT accesses the following types of YouTube data, which are **essential for core functionality** but 
                are **NEVER stored, persisted, or saved** on our servers beyond the immediate session needed to generate a suggestion. 
                This access requires the OAuth scope: <code>https://www.googleapis.com/auth/youtube.force-ssl</code>.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed">
                <li>**YouTube Comment Threads:** We access comment text, author details (display name, profile image), and metadata (like/dislike counts) for videos belonging to the authenticated user.</li>
                <li>**YouTube Video Metadata:** We access basic video details (title, description, ID) to associate comments correctly.</li>
                <li>**Channel Metadata:** We access the authenticated user's channel information (channel name, ID) to display the correct data.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed font-semibold mt-4">
                We do not access, store, or process any other YouTube or Google data beyond what is explicitly listed above.
              </p>

              <h3 className="text-xl font-semibold">C. Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use <strong>Simple Analytics</strong>, a privacy-first analytics tool that
                collects <strong>no personal data</strong> and uses no cookies.
              </p>
            </div>

            <h2 className="text-2xl font-semibold">2. How We Use Your Information (Data Usage)</h2>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to using your data only to provide and improve the ReplyYT service. 
              **We never sell, rent, or trade your personal data or your Google User Data.**
            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">A. Usage of Google Account Information (Name & Email)</h3>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed">
                <li>**Authentication:** To verify your identity when you sign in.</li>
                <li>**Account Management:** To create, manage, and identify your unique user account within our database (Supabase).</li>
                <li>**Service Communication:** To send essential service-related emails (e.g., account deletion confirmation, major policy updates).</li>
              </ul>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold">B. Usage of YouTube Data (Comment Threads & Metadata)</h3>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed">
                <li>**Core Functionality:** To fetch and display your YouTube comments and associated video/channel details on the ReplyYT dashboard.</li>
                <li>**AI Analysis & Suggestion Generation:** The fetched comment threads are immediately processed by our AI model (temporarily, in-memory) to generate relevant filtering, analysis, and AI reply suggestions for your review.</li>
                <li>**Data Minimization:** All YouTube data accessed is strictly used for the immediate request and is discarded once the AI processing is complete and the results are presented to the user. **No comment thread data or derived AI insights are stored persistently by ReplyYT.**</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold">3. Google API Disclosure (Limited Use)</h2>
            <p className="text-muted-foreground leading-relaxed">
              ReplyYT’s use of information received from Google APIs will adhere to the 
              **Google API Services User Data Policy,** including the **Limited Use requirements.**
            </p>
            <ul className="list-disc pl-6 text-muted-foreground leading-relaxed">
              <li>**No Transfer:** We will not transfer Google user data to others unless necessary to provide or improve user-facing features, comply with applicable law, or as part of a merger/acquisition.</li>
              <li>**No Selling:** We will not use or transfer the data to serve advertisements.</li>
              <li>**No Human Review:** We will not allow humans to read the data, unless: (a) we have your affirmative agreement for specific messages, (b) it is necessary for security purposes (e.g. investigating abuse), (c) it is necessary to comply with applicable law, or (d) the data has been aggregated and anonymized.</li>
            </ul>

            <h2 className="text-2xl font-semibold">4. Data Storage, Security & Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We store only your name and email in our secure **Supabase** database. 
              YouTube data is **never stored**. 
            </p>
            <ul className="list-disc pl-6 text-muted-foreground leading-relaxed">
              <li>**Security:** All stored data is protected through **encryption at rest**, **encrypted connections (SSL/TLS)**, and **strict access control** (only necessary personnel can access production data).</li>
              <li>**Third-Party Processors:**
                <ul>
                    <li>**Supabase:** Secure database for storing name + email.</li>
                    <li>**BoostToad:** Feedback/widget integration (may collect non-personal interaction data).</li>
                    <li>**Simple Analytics:** Privacy-focused analytics (collects no personal data).</li>
                </ul>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your stored data (Name + Email) is retained until you request deletion. YouTube data 
              accessed for analysis is never persisted and is deleted from our temporary memory immediately 
              after the AI suggestion is generated.
            </p>

            <h2 className="text-2xl font-semibold">6. Data Deletion</h2>
            <p className="text-muted-foreground leading-relaxed">
              To delete your account and all stored personal data (Name & Email), please email a request to:
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