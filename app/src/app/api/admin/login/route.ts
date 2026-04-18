import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// ── In-memory rate limiter ──
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return { allowed: true, retryAfterMs: 0 }
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterMs = WINDOW_MS - (now - record.firstAttempt)
    return { allowed: false, retryAfterMs }
  }

  record.count += 1
  return { allowed: true, retryAfterMs: 0 }
}

function clearRateLimit(ip: string) {
  loginAttempts.delete(ip)
}

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ──
    const ip = getClientIp(request)
    const { allowed, retryAfterMs } = checkRateLimit(ip)

    if (!allowed) {
      const retryMinutes = Math.ceil(retryAfterMs / 60000)
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login. Coba lagi dalam ${retryMinutes} menit.`,
          retryAfterMs,
        },
        { status: 429 }
      )
    }

    // ── Parse body ──
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Password minimum length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // ── Create Supabase server client with cookie handling ──
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

    // ── Authenticate with Supabase ──
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !data.user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // ── Verify admin role ──
    const user = data.user
    const role = user.user_metadata?.role || user.app_metadata?.role
    const adminEmail = process.env.ADMIN_EMAIL
    const isAdmin = role === 'admin' || (adminEmail && user.email === adminEmail)

    if (!isAdmin) {
      // Sign out non-admin user immediately
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Akun ini tidak memiliki akses admin' },
        { status: 403 }
      )
    }

    // ── Success: clear rate limit for this IP ──
    clearRateLimit(ip)

    // Log admin login (console for now; can be extended to a DB table)
    console.log(`[ADMIN LOGIN] ${user.email} logged in at ${new Date().toISOString()} from IP: ${ip}`)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: 'admin',
      },
    })
  } catch (err: any) {
    console.error('[ADMIN LOGIN ERROR]', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
