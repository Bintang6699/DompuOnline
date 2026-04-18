import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/supabase-server'

/**
 * GET /api/admin/verify
 * Checks if the current session belongs to an admin user.
 * Used by client-side components to verify auth status.
 */
export async function GET() {
  try {
    const { user, isAdmin } = await verifyAdmin()

    if (!user) {
      return NextResponse.json(
        { authenticated: false, isAdmin: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!isAdmin) {
      return NextResponse.json(
        { authenticated: true, isAdmin: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (err) {
    console.error('[ADMIN VERIFY ERROR]', err)
    return NextResponse.json(
      { authenticated: false, isAdmin: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
