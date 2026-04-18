import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * PUT /api/admin/settings
 * Update admin email and/or password.
 * Requires authenticated admin session.
 */
export async function PUT(request: NextRequest) {
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

    // Verify authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Silakan login terlebih dahulu' },
        { status: 401 }
      )
    }

    // Verify admin role
    const role = user.user_metadata?.role || user.app_metadata?.role
    const adminEmail = process.env.ADMIN_EMAIL
    const isAdmin = role === 'admin' || (adminEmail && user.email === adminEmail)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Akses admin diperlukan' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { currentPassword, newEmail, newPassword } = body

    // Current password is required for any change
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Password saat ini wajib diisi untuk mengubah pengaturan' },
        { status: 400 }
      )
    }

    // Verify current password by re-authenticating
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Password saat ini salah' },
        { status: 401 }
      )
    }

    const updates: Record<string, string> = {}

    // Validate new email
    if (newEmail && newEmail !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json(
          { error: 'Format email baru tidak valid' },
          { status: 400 }
        )
      }
      updates.email = newEmail
    }

    // Validate new password
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'Password baru minimal 8 karakter' },
          { status: 400 }
        )
      }
      // Check password strength
      const hasUpperCase = /[A-Z]/.test(newPassword)
      const hasLowerCase = /[a-z]/.test(newPassword)
      const hasNumber = /[0-9]/.test(newPassword)
      const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)
      
      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return NextResponse.json(
          { error: 'Password baru harus mengandung huruf besar, huruf kecil, dan angka' },
          { status: 400 }
        )
      }
    }

    // Nothing to update
    if (!newEmail && !newPassword) {
      return NextResponse.json(
        { error: 'Tidak ada perubahan yang dilakukan' },
        { status: 400 }
      )
    }

    // Use service role to update user (more reliable)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const updatePayload: Record<string, any> = {}
    if (newEmail && newEmail !== user.email) {
      updatePayload.email = newEmail
    }
    if (newPassword) {
      updatePayload.password = newPassword
    }

    // Preserve admin role in metadata
    updatePayload.user_metadata = {
      ...user.user_metadata,
      role: 'admin',
    }
    updatePayload.app_metadata = {
      ...user.app_metadata,
      role: 'admin',
    }

    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      }
    )

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}))
      console.error('[ADMIN SETTINGS UPDATE ERROR]', errData)
      return NextResponse.json(
        { error: errData.msg || 'Gagal mengubah pengaturan akun' },
        { status: 500 }
      )
    }

    // Update ADMIN_EMAIL in env if email changed (runtime only, not file)
    // For persistent change, user should update .env.local manually

    console.log(`[ADMIN SETTINGS] ${user.email} updated settings at ${new Date().toISOString()}`)

    // If email changed, sign out so user re-logs with new email
    if (newEmail && newEmail !== user.email) {
      await supabase.auth.signOut()
      return NextResponse.json({
        success: true,
        message: 'Email berhasil diubah. Silakan login kembali dengan email baru.',
        requireRelogin: true,
      })
    }

    // If only password changed, re-sign in with new password
    if (newPassword) {
      await supabase.auth.signInWithPassword({
        email: user.email!,
        password: newPassword,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil diperbarui.',
      requireRelogin: false,
    })
  } catch (err: any) {
    console.error('[ADMIN SETTINGS ERROR]', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
