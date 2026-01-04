// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
//used for client files whereas the lib one is used for the apis.

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}