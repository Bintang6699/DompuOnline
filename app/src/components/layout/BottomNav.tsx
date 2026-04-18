'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Newspaper, Store, UserPlus, ShoppingBag, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/mitra', label: 'Mitra', icon: ShoppingBag },
  { href: '/news', label: 'Berita', icon: Newspaper },
  { href: '/about', label: 'Info', icon: Info },
  { href: '/daftar', label: 'Daftar', icon: UserPlus },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/50 bottom-nav pb-safe">
      <div className="max-w-lg mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-purple-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <div
                  className={cn(
                    'p-1.5 rounded-xl transition-all duration-200',
                    isActive && 'bg-purple-100'
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={cn('text-xs font-medium', isActive ? 'text-purple-600' : 'text-gray-400')}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
