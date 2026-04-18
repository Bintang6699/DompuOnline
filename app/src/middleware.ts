import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Rate limiting store (in-memory, resets on server restart) ──
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export function isRateLimited(ip: string): { limited: boolean; remainingMs: number } {
  const record = loginAttempts.get(ip)
  if (!record) return { limited: false, remainingMs: 0 }

  const elapsed = Date.now() - record.lastAttempt
  if (elapsed > LOCKOUT_DURATION_MS) {
    loginAttempts.delete(ip)
    return { limited: false, remainingMs: 0 }
  }

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    return { limited: true, remainingMs: LOCKOUT_DURATION_MS - elapsed }
  }

  return { limited: false, remainingMs: 0 }
}

export function recordLoginAttempt(ip: string) {
  const record = loginAttempts.get(ip)
  if (!record) {
    loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() })
  } else {
    record.count += 1
    record.lastAttempt = Date.now()
  }
}

export function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip)
}

// ── Security headers ──
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// ── Middleware ──
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session (IMPORTANT: don't use getSession — getUser hits the auth server)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Apply security headers to all responses ──
  Object.entries(securityHeaders).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value)
  })

  // ── Admin route protection ──
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'
  const isAdminApi = pathname.startsWith('/api/admin')

  // Allow login page and login API for unauthenticated users
  if (isLoginPage || pathname === '/api/admin/login') {
    // If already authenticated as admin, redirect to dashboard
    if (user) {
      const role = user.user_metadata?.role || user.app_metadata?.role
      const adminEmail = process.env.ADMIN_EMAIL
      const isAdmin = role === 'admin' || (adminEmail && user.email === adminEmail)

      if (isAdmin && isLoginPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
    }
    return supabaseResponse
  }

  // For all admin routes: require authentication
  if (isAdminRoute || isAdminApi) {
    if (!user) {
      // Not logged in — redirect to login
      if (isAdminApi) {
        return NextResponse.json(
          { error: 'Unauthorized: Please log in' },
          { status: 401 }
        )
      }
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Check admin role
    const role = user.user_metadata?.role || user.app_metadata?.role
    const adminEmail = process.env.ADMIN_EMAIL
    const isAdmin = role === 'admin' || (adminEmail && user.email === adminEmail)

    if (!isAdmin) {
      // Authenticated but NOT admin
      if (isAdminApi) {
        return NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        )
      }
      // Sign out the non-admin user to clear cookies
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('error', 'forbidden')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
