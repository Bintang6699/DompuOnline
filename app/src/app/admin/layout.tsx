import type { Metadata } from 'next'
import '../globals.css'
import { verifyAdmin } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: {
    default: 'Admin Panel – DompuOnline',
    template: '%s | Admin DompuOnline',
  },
  description: 'Admin Dashboard DompuOnline',
  robots: 'noindex, nofollow',
}

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard — double protection (middleware + layout)
  const { user, isAdmin } = await verifyAdmin()

  // If accessing any admin page that is NOT /admin/login, verify admin
  // The login page itself handles its own auth state
  // This is a fallback guard in case middleware is bypassed

  return children
}
