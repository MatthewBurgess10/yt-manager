"use client"

import { useEffect } from "react"
import { Youtube, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Extend the Window interface so TypeScript knows about 'uj'
declare global {
  interface Window {
    uj?: {
      init: (key: string, options: { widget: boolean; position: string; theme: string }) => void;
      open: () => void; // UserJot provides this to open the widget manually
    };
  }
}

export function DashboardHeader() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }
  useEffect(() => {
    // Initialize UserJot once the script loads
    const initUserJot = () => {
      window.uj?.init("cmhp2a4xr01xd14ny8oxkfdhm", {
        widget: true,
        position: "right",
        theme: "auto",
      });
    };

    if (!window.uj) {
      const script = document.createElement("script");
      script.src = "https://cdn.userjot.com/uj.js"; // Adjust if different
      script.async = true;
      script.onload = initUserJot;
      document.body.appendChild(script);
    } else {
      initUserJot();
    }
  }, []);

  // Function to open the widget when button is clicked
  const handleOpenWidget = () => {
    window.uj?.open?.(); // Safely call the open method
  };

  return (
    <header className="border-b-2 bg-background/90 backdrop-blur-xl supports-backdrop-filter:bg-background/90 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-600/30">
            <Youtube className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl">CommentIQ</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleOpenWidget}>
            Feedback
          </Button>
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
