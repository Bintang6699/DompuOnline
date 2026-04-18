'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function Header() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/50 shadow-sm">
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/logo.png"
              alt="DompuOnline"
              width={130}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1.5">
              <MapPin size={12} className="text-purple-600" />
              <span className="font-medium">Dompu, NTB</span>
            </div>
          </div>
        </div>
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari toko, kuliner, jasa..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
          />
        </form>
      </div>
    </header>
  )
}
