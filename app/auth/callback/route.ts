import { createClient, flushPendingCookies } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      // Grab any cookies Supabase requested we set during the exchange.
      const pending = flushPendingCookies()

      // Debug logging to help trace cookie propagation during OAuth.
      // Run the dev server and watch the terminal for this output after an OAuth redirect.
      try {
        console.log(`[auth/callback] redirect target=${next} pendingCookiesCount=${pending.length}`)
        pending.forEach(c => console.log(`[auth/callback] cookie: ${c.name} s=${JSON.stringify(c.options)}`))
      } catch (e) {
        // no-op in environments that don't support console
      }

      // Build the final redirect and attach cookies to it.
      let finalRedirect: ReturnType<typeof NextResponse.redirect>
      if (isLocalEnv) {
        finalRedirect = NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        finalRedirect = NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        finalRedirect = NextResponse.redirect(`${origin}${next}`)
      }

      pending.forEach(({ name, value, options }) => {
        finalRedirect.cookies.set(name, value, options)
      })

      return finalRedirect
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
