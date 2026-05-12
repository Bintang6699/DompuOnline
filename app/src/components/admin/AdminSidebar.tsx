'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, CheckSquare, Star, CreditCard,
  Newspaper, LogOut, ChevronRight, Shield, Image as ImageIcon, Briefcase, Phone, Settings
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/sliders', label: 'Slider Banner', icon: ImageIcon },
  { href: '/admin/vendors', label: 'Manajemen Mitra', icon: Users },
  { href: '/admin/survey', label: 'Survei', icon: CheckSquare },
  { href: '/admin/ratings', label: 'Rating', icon: Star },
  { href: '/admin/subscriptions', label: 'Langganan', icon: CreditCard },
  { href: '/admin/jobs', label: 'Loker Admin', icon: Briefcase },
  { href: '/admin/news', label: 'Berita', icon: Newspaper },
  { href: '/admin/community', label: 'Komunitas', icon: Users },
  { href: '/admin/contact', label: 'Kontak Admin', icon: Phone },
  { href: '/admin/security', label: 'Pusat Keamanan', icon: Shield },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      // Even if API fails, redirect to login
    }
    router.push('/admin/login')
    router.refresh()
  }

  // Auto logout after 30 minutes of inactivity
  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        handleLogout()
      }, 30 * 60 * 1000) // 30 minutes
    }

    const events = ['mousemove', 'keypress', 'mousedown', 'scroll', 'touchstart']
    events.forEach(event => window.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(idleTimer)
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside className="admin-sidebar w-64 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="font-black text-white text-sm">DompuOnline</p>
            <p className="text-[10px] text-purple-300">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight size={14} className="text-purple-300" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-200 hover:bg-white/10 hover:text-white transition-all w-full"
        >
          <LogOut size={17} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
