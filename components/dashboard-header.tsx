"use client"

import { useEffect, useState } from "react"
import { Youtube, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"


export function DashboardHeader() {
  const router = useRouter()
  const supabase = createClient()
  const [widgetReady, setWidgetReady] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }



  return (
    <header className="border-b-2 bg-background/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/replyyt_icon_new.png" alt="ReplyYT Logo" className="h-8 w-8" />
          {/* <span className="font-bold text-xl">ReplyYT</span> */}
        </div>

        <div className="flex items-center gap-4">

          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            Welcome back, Creator
          </span>
          <Button
            variant="outline"
            size="sm"
            className="font-semibold border-2 bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
