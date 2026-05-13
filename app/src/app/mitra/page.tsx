'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { VendorCard, VendorCardSkeleton } from '@/components/vendors/VendorCard'
import { supabase } from '@/lib/supabase'
import { Vendor } from '@/lib/types'
import { Search, MapPin, SlidersHorizontal, Tag } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'
import Link from 'next/link'

import { getPublicVendors } from '@/app/actions/vendors'

export default function MitraPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('semua')
  const [featuredVendor, setFeaturedVendor] = useState<Vendor | null>(null)

  useEffect(() => {
    async function fetchMitraData() {
      setLoading(true)
      
      const data = await getPublicVendors()
      
      if (data) {
        let filteredInfo = data as Vendor[]
        
        // Random Banner Logic: Pick one random featured vendor or any vendor if no featured
        if (data.length > 0) {
          const featured = data.filter(v => v.is_featured)
          const pool = featured.length > 0 ? featured : data
          const randomVendor = pool[Math.floor(Math.random() * pool.length)]
          setFeaturedVendor(randomVendor as Vendor)
        }

        // Apply client side filters
        if (activeCategory !== 'semua') {
          filteredInfo = filteredInfo.filter(v => v.categories?.slug === activeCategory)
        }
        
        setVendors(filteredInfo)
      }
      setLoading(false)
    }

    fetchMitraData()
  }, [activeCategory])

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32">
      <Header />
      
      <main className="max-w-lg mx-auto">
        {/* Category Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4 shadow-sm relative isolate">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Pilih Kategori</p>
          
          {/* Scrollable Category Filter */}
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar snap-x">
            <button
              onClick={() => setActiveCategory('semua')}
              className={`snap-start shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'semua' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Semua
            </button>
            {CATEGORIES.map(cat => (
              cat.slug === 'jobs' ? (
                <Link
                  key={cat.slug}
                  href="/jobs"
                  className="snap-start shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-purple-600 hover:text-white"
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Link>
              ) : (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`snap-start shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeCategory === cat.slug 
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              )
            ))}
          </div>
        </div>

        <div className="px-4 mt-6 space-y-6">
          {/* Random Featured Banner */}
          {featuredVendor && activeCategory === 'semua' && (
            <section>
              <h2 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                <Tag size={16} className="text-purple-600" /> Spesial Hari Ini
              </h2>
              <Link href={`/vendor/${featuredVendor.id}`} className="block relative aspect-[21/9] rounded-2xl overflow-hidden shadow-sm group cursor-pointer bg-purple-100">
                <img 
                  src={featuredVendor.media?.find(m => m.type === 'image')?.url || '/placeholder.jpg'} 
                  alt={featuredVendor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=DompuOnline' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full w-max mb-1 uppercase tracking-tight">Rekomendasi</span>
                  <h3 className="text-white font-black text-lg leading-tight line-clamp-1">{featuredVendor.name}</h3>
                  <p className="text-white/80 text-xs line-clamp-1">{featuredVendor.description}</p>
                </div>
              </Link>
            </section>
          )}

          {/* Vendors Grid (2 columns like Shopee) */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-gray-500" /> 
                {activeCategory === 'semua' ? 'Semua Mitra' : `Mitra ${CATEGORIES.find(c => c.slug === activeCategory)?.name}`}
              </h2>
              <span className="text-xs text-gray-400 font-medium">{vendors.length} ditemukan</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => <VendorCardSkeleton key={i} />)}
              </div>
            ) : vendors.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {vendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} shrink />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Mitra Tidak Ditemukan</h3>
                <p className="text-sm text-gray-500">Coba gunakan kata kunci lain</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
