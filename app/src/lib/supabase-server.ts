import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for Server Components / Server Actions / Route Handlers.
 * Reads & writes Supabase auth cookies via Next.js `cookies()`.
 */
export async function createSupabaseServerClient() {
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll can fail in Server Components (read-only context).
            // This is fine – the middleware handles refresh below.
          }
        },
      },
    }
  )
}

/**
 * Verify the current user is authenticated AND has admin role.
 * Returns { user, isAdmin } or throws/returns null.
 */
export async function verifyAdmin() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, isAdmin: false }
  }

  // Check admin role from user metadata
  const role = user.user_metadata?.role || user.app_metadata?.role
  const isAdmin = role === 'admin'

  // Also check against the ADMIN_EMAIL env variable as a fallback
  const adminEmail = process.env.ADMIN_EMAIL
  const isAdminByEmail = adminEmail && user.email === adminEmail

  return {
    user,
    isAdmin: isAdmin || !!isAdminByEmail,
  }
}
