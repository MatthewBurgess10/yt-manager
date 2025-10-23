"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Youtube } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    // Placeholder for Google OAuth
    // In production, this would redirect to Google OAuth
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Youtube className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to CommentIQ</CardTitle>
          <CardDescription>Sign in with your Google account to manage your YouTube comments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGoogleLogin} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
