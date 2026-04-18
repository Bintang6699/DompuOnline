'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { Star, RefreshCw, Search } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'
import Link from 'next/link'

const CATEGORY_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'transport', label: 'Transportasi' },
  { value: 'food', label: 'Kuliner' },
  { value: 'shopping', label: 'Belanja' },
  { value: 'services', label: 'Jasa' },
]

export default function AdminRatingsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchRatings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('status', 'approved')
      if (categoryFilter) params.set('category', categoryFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/vendors?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      
      // Sort alphabetically like the original order('name', { ascending: true })
      let vends = json.vendors || []
      vends.sort((a: any, b: any) => a.name.localeCompare(b.name))
      
      setVendors(vends)
    } catch (err) {
      console.error('Fetch ratings error:', err)
      setVendors([])
    }
    setLoading(false)
  }

  useEffect(() => { fetchRatings() }, [categoryFilter])

  const calculateAvg = (ratings: any[]) => {
    if (!ratings || ratings.length === 0) return 0
    const r = ratings[0]
    return ((r.quality_score || 0) + (r.cleanliness_score || 0) + (r.trust_score || 0)) / 3
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Manajemen Rating</h1>
              <p className="text-sm text-gray-500">Pantau kualitas pelayanan mitra</p>
            </div>
            <button onClick={fetchRatings} className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-purple-600 shadow-sm transition-all">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchRatings()}
                placeholder="Cari nama mitra..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold shadow-sm"
              />
            </div>
            
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    categoryFilter === cat.value
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-50 animate-pulse h-48" />
              ))
            ) : vendors.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-[32px] border border-dashed border-gray-200 text-center">
                <Star size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Tidak ada mitra ditemukan</p>
              </div>
            ) : vendors.map((vendor) => {
              const avg = calculateAvg(vendor.ratings)
              return (
                <div key={vendor.id} className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-gray-900 truncate uppercase tracking-tight">{vendor.name}</h3>
                      <p className="text-xs text-gray-400 font-bold">{vendor.categories?.icon} {vendor.categories?.name}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl ${
                      avg >= 4 ? 'bg-green-50 text-green-600' : avg >= 3 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                    }`}>
                      <Star size={14} className="fill-current" />
                      <span className="text-sm font-black">{avg.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {[
                      { label: 'Kualitas', score: vendor.ratings?.[0]?.quality_score || 0 },
                      { label: 'Kebersihan', score: vendor.ratings?.[0]?.cleanliness_score || 0 },
                      { label: 'Kepercayaan', score: vendor.ratings?.[0]?.trust_score || 0 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase w-20">{item.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(item.score / 5) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-gray-700">{item.score}/5</span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/admin/vendors/${vendor.id}`} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-500 rounded-2xl text-xs font-black hover:bg-purple-600 hover:text-white transition-all">
                    Lihat Detail & Update Rating
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
