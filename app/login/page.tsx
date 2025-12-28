import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Login</h1>
            <p className="text-muted-foreground">Access your saved reports and insights</p>
          </div>

          <div className="py-8">
            <p className="text-sm text-muted-foreground">
              Login functionality will be added in the next phase. For now, analyze your channel to see how Replyt
              works!
            </p>
          </div>

          <Link href="/">
            <Button variant="outline" className="w-full bg-transparent">
              Back to home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
