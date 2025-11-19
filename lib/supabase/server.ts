import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Buffer for cookies Supabase requests us to set during server-side flows.
// Route handlers can call `flushPendingCookies` to get and attach them
// to a redirect response (OAuth callback flow).
const pendingCookies: { name: string; value: string; options?: any }[] = []

export function flushPendingCookies() {
  const copied = pendingCookies.splice(0, pendingCookies.length)
  return copied
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Preserve for redirect responses
              pendingCookies.push({ name, value, options })
              // Also attempt to set on the current cookie store (normal flow)
              cookieStore.set(name, value, options)
            })
          } catch {
            // Running in a server component without a cookie store - ignore
          }
        },
      },
    }
  )
}