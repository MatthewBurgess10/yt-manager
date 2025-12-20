"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Youtube, Sparkles, TrendingUp, MessageSquare, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    // I removed the force-ssl url from here and all of a sudden it might not be working? 
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/userinfo.profile",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      console.error("Error logging in:", error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-red-50/30 dark:to-red-950/10 p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-3 bg-red-600 rounded-lg">
                <Youtube className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-balance">ReplyYT</h1>
            </Link>
            <p className="text-xl text-muted-foreground text-balance">
              Smart YouTube comment management so you can engage with your community instead of drowning in chaos.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="shrink-0 p-3 bg-red-100 dark:bg-red-950/50 rounded-lg h-fit">
                <Sparkles className="h-5 w-5 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Smart Filtering & Ranking</h3>
                <p className="text-sm text-muted-foreground">
                  AI sorts comments by urgency so you focus on what matters most
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0 p-3 bg-red-100 dark:bg-red-950/50 rounded-lg h-fit">
                <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Instant Insights</h3>
                <p className="text-sm text-muted-foreground">
                  See which comments boost engagement and community loyalty
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0 p-3 bg-red-100 dark:bg-red-950/50 rounded-lg h-fit">
                <MessageSquare className="h-5 w-5 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Reply-Ready View</h3>
                <p className="text-sm text-muted-foreground">
                  Respond directly from the dashboard without losing context
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login card */}
        <Card className="w-full shadow-2xl border-red-200 dark:border-red-900/50">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="flex justify-center mb-2 lg:hidden">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <div className="p-3 bg-red-600 rounded-lg">
                  <Youtube className="h-10 w-10 text-white" />
                </div>
              </Link>
            </div>
            <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Sign in with Google to start managing your YouTube comments smarter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
              size="lg"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              {/* <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Secure authentication</span>
              </div> */}
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium">You'll get access to:</p>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
                  Smart comment filtering and ranking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
                  Real-time insights on high-priority comments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
                  Reply-ready dashboard with instant sync
                </li>
              </ul>
            </div>

            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </p>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
