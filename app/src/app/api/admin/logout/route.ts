import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/logout
 * Securely signs out the admin user and clears session cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              })
            )
          },
        },
      }
    )

    // Get user info for logging before sign out
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.auth.signOut()

    console.log(`[ADMIN LOGOUT] ${user?.email || 'unknown'} logged out at ${new Date().toISOString()}`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ADMIN LOGOUT ERROR]', err)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
