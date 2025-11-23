import { createClient, flushPendingCookies } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error(`[auth/callback] error during code exchange: ${error.message}`)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
      )
    }

    if (!data.session) {
      console.error("[auth/callback] No session after exchange")
      return NextResponse.redirect(new URL("/login?error=no_session", origin))
    }

    const forwardedHost = request.headers.get("x-forwarded-host")
    const isLocalEnv = process.env.NODE_ENV === "development"

    const pending = flushPendingCookies()

    const hasAuthCookie = pending.some(c =>
      c.name.includes("auth") || c.name.includes("session")
    )

    if (!hasAuthCookie) {
      console.error("[auth/callback] Missing auth cookies:",
        pending.map(c => c.name)
      )
    }

    try {
      console.log(`[auth/callback] redirect target=${next} pendingCookiesCount=${pending.length}`)
      pending.forEach(c =>
        console.log(`[auth/callback] cookie: ${c.name} s=${JSON.stringify(c.options)}`)
      )
    } catch (e) {}

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

  return NextResponse.redirect(`${origin}/login`)
}
