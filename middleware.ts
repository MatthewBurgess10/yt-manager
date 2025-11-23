import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // 1. INITIALIZE THE RESPONSE OBJECT
  // We use NextResponse.next() to avoid an early redirect.
  // This is the object we will attach Supabase cookies to.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Buffer for cookies that Supabase requests to set. We attach these to
  // the final response or any redirect response so cookies aren't lost.
  const pendingCookies: { name: string; value: string; options?: any }[] = []

  // 2. CREATE THE SUPABASE CLIENT
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // CORRECTED setAll implementation:
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Save to buffer so we can copy them to any redirect responses.
            pendingCookies.push({ name, value, options })

            // Also attach to the normal response (non-redirect flow).
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // 3. GET USER AND HANDLE REDIRECTS
  // This call will trigger the 'setAll' function above if the session needs refreshing.
  const {
    data: { user },
    error: userError ,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error("[middleware] getUser error:", userError)
  }

  const { pathname } = request.nextUrl
  const origin = request.url // Use request.url for full context

  // Redirect to login if not authenticated and trying to access dashboard
  if (!user && pathname.startsWith("/dashboard")) {
    // Create a redirect response and copy any pending cookies to it so they are preserved.
    const redirectResponse = NextResponse.redirect(new URL("/login", origin))
    pendingCookies.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options)
    })
    return redirectResponse
  }

  // Redirect to dashboard if already authenticated and on login page
  if (user && pathname === "/login") {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", origin))
    pendingCookies.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options)
    })
    return redirectResponse
  }

  // 4. RETURN THE RESPONSE (WITH POTENTIALLY UPDATED COOKIES)
  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}