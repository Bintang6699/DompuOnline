'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react'

const CATEGORY_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'transport', label: 'Transportasi' },
  { value: 'food', label: 'Kuliner' },
  { value: 'shopping', label: 'Belanja' },
  { value: 'services', label: 'Jasa' },
]

export default function AdminSurveyPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter) params.set('category', categoryFilter)
      
      const res = await fetch(`/api/admin/vendors?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      const allVendors = json.vendors || []
      
      // Filter only pending and surveyed
      const filtered = allVendors.filter((v: any) => v.status === 'pending' || v.status === 'surveyed')
      setVendors(filtered)
    } catch (err) {
      console.error('Fetch survey vendors error', err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchVendors() }, [categoryFilter])

  const markSurveyed = async (id: string) => {
    try {
      await fetch('/api/admin/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'surveyed' })
      })
    } catch (err) {
      console.error(err)
    }
    await fetchVendors()
  }

  const approve = async (id: string) => {
    try {
      await fetch('/api/admin/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' })
      })
    } catch (err) {
      console.error(err)
    }
    await fetchVendors()
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Sistem Survei</h1>
              <p className="text-sm text-gray-500">Kelola proses survei lapangan mitra</p>
            </div>
            <button onClick={fetchVendors} className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-purple-600">
              <RefreshCw size={18} />
            </button>
          </div>

          {/* Filters & Legend */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-100 shadow-sm">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                    categoryFilter === cat.value
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              {[
                { label: 'Pending', color: 'badge-pending' },
                { label: 'Survei', color: 'badge-surveyed' },
              ].map((b) => (
                <span key={b.label} className={`text-xs px-3 py-1.5 rounded-full font-semibold ${b.color}`}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="h-5 w-48 skeleton rounded mb-2" />
                  <div className="h-3 w-32 skeleton rounded" />
                </div>
              ))
            ) : vendors.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
                <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
                <p className="font-semibold text-gray-700">Semua sudah diproses!</p>
                <p className="text-sm text-gray-400">Tidak ada mitra yang menunggu survei</p>
              </div>
            ) : vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{vendor.name}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold badge-${vendor.status}`}>
                        {vendor.status === 'pending' ? 'Pending' : 'Survei'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{vendor.owner_name} · {vendor.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {vendor.categories?.icon} {vendor.categories?.name} · Daftar: {formatDate(vendor.created_at)}
                    </p>
                    {vendor.maps_link && (
                      <a href={vendor.maps_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:underline mt-1 block">
                        📍 Lihat Lokasi
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {vendor.status === 'pending' && (
                      <button onClick={() => markSurveyed(vendor.id)}
                        className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                        <Clock size={13} /> Tandai Survei
                      </button>
                    )}
                    <button onClick={() => approve(vendor.id)}
                      className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 font-semibold px-3 py-2 rounded-xl hover:bg-green-100 transition-colors">
                      <CheckCircle size={13} /> Setujui
                    </button>
                    <Link href={`/admin/vendors/${vendor.id}`}
                      className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 font-semibold px-3 py-2 rounded-xl hover:bg-purple-100 transition-colors">
                      Detail →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
