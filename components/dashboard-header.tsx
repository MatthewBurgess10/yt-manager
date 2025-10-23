"use client"

import { Youtube, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <header className="border-b-2 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-600/30">
            <Youtube className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl">CommentIQ</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Welcome back, Creator</span>
          <Button variant="outline" size="sm" className="font-semibold border-2 bg-transparent" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
