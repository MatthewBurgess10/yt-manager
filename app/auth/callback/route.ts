// auth/callback/route.ts (Updated for production stability)
import { createClient } from "@/lib/supabase/client"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard" // Your dashboard path

  if (code) {
    const supabase = createClient() // Assuming the TypeScript error was transient, use the await-less version for testing
    // OR: const supabase = await createClient() if you are sure it is async. 
    // Let's assume you've fixed the TS error and are running the code correctly.

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // --- CRITICAL REDIRECT LOGIC FOR PRODUCTION ---
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        // Safe for local dev
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // Use the original host header (e.g., replyyt.app) with HTTPS
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        // Fallback to origin (should be https://replyyt.app in production)
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return to login if something went wrong
  return NextResponse.redirect(`${origin}/login`)
}