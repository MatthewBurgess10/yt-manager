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
            // CRITICAL: Attach the cookies to the 'response' object
            // which will be returned at the end of the middleware.
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
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const origin = request.url // Use request.url for full context

  // Redirect to login if not authenticated and trying to access dashboard
  if (!user && pathname.startsWith("/dashboard")) {
    // Note: Use a clean NextResponse.redirect here
    return NextResponse.redirect(new URL("/login", origin))
  }

  // Redirect to dashboard if already authenticated and on login page
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", origin))
  }

  // 4. RETURN THE RESPONSE (WITH POTENTIALLY UPDATED COOKIES)
  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}