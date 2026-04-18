'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { Vendor } from '@/lib/types'
import { getStatusColor } from '@/lib/utils'
import Link from 'next/link'
import {
  Search, Filter, CheckCircle, XCircle, Eye, Clock,
  RefreshCw, ChevronDown
} from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'surveyed', label: 'Sudah Survei' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: 'Semua Kategori' },
  { value: 'transport', label: 'Transportasi' },
  { value: 'food', label: 'Kuliner' },
  { value: 'shopping', label: 'Belanja' },
  { value: 'services', label: 'Jasa' },
]

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const target = new Date(endDate).getTime()
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft('EXPIRED')
        clearInterval(interval)
        return
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${d}h ${h}m ${m}s ${s}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block w-fit mb-1 border border-purple-100">
        AKTIF
      </span>
      <span className="text-[11px] font-mono font-bold text-gray-500 tabular-nums">
        {timeLeft || '---'}
      </span>
    </div>
  )
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchVendors = async () => {
    setLoading(true)
    try {
      // Use admin API route to bypass RLS and fetch ALL vendors including pending
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (categoryFilter) params.set('category', categoryFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/vendors?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setVendors(data.vendors || [])
    } catch (err) {
      console.error('Fetch vendors error:', err)
      setVendors([])
    }
    setLoading(false)
  }

  useEffect(() => { fetchVendors() }, [statusFilter, categoryFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVendors()
  }

  const updateVendorStatus = async (id: string, status: string) => {
    setActionLoading(id + status)
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('Gagal update status')
    } catch (err) {
      console.error('Update status error:', err)
    }
    await fetchVendors()
    setActionLoading(null)
  }

  const activateSubscription = async (vendor: any) => {
    setActionLoading(vendor.id + 'sub')
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, activateSubscription: true }),
      })
      if (!res.ok) throw new Error('Gagal aktifkan subscription')
    } catch (err) {
      console.error('Activate subscription error:', err)
    }
    await fetchVendors()
    setActionLoading(null)
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Manajemen Mitra</h1>
              <p className="text-sm text-gray-500">{vendors.length} mitra ditemukan</p>
            </div>
            <button onClick={fetchVendors} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-purple-600 transition-colors">
              <RefreshCw size={18} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama mitra..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <button type="submit" className="btn-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
                Cari
              </button>
            </form>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Mitra</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Kategori</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Status Toko</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Masa Langganan</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-4"><div className="h-4 w-40 skeleton rounded" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-20 skeleton rounded" /></td>
                        <td className="px-4 py-4"><div className="h-6 w-16 skeleton rounded-full" /></td>
                        <td className="px-4 py-4"><div className="h-6 w-16 skeleton rounded-full" /></td>
                        <td className="px-5 py-4"><div className="h-8 w-24 skeleton rounded-lg ml-auto" /></td>
                      </tr>
                    ))
                  ) : vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                            {vendor.media?.[0]?.url ? (
                              <img src={vendor.media[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">{vendor.categories?.icon || '🏪'}</div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 leading-tight">{vendor.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{vendor.owner_name} · {vendor.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-600">{vendor.categories?.icon} {vendor.categories?.name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider badge-${vendor.status}`}>
                          {vendor.status === 'pending' ? 'Pending' :
                           vendor.status === 'surveyed' ? 'Survei' :
                           vendor.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                         {vendor.subscription_status === 'active' && vendor.subscription_end ? (
                           <CountdownTimer endDate={vendor.subscription_end} />
                         ) : (
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider badge-${vendor.subscription_status}`}>
                            {vendor.subscription_status === 'expired' ? 'Expired' : 'Menunggu'}
                          </span>
                         )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/vendors/${vendor.id}`}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                            title="Detail"
                          >
                            <Eye size={15} />
                          </Link>
                          {vendor.status === 'pending' && (
                            <button
                              onClick={() => updateVendorStatus(vendor.id, 'surveyed')}
                              disabled={!!actionLoading}
                              className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Tandai Survei"
                            >
                              <Clock size={15} />
                            </button>
                          )}
                          {(vendor.status === 'pending' || vendor.status === 'surveyed') && (
                            <>
                              <button
                                onClick={() => updateVendorStatus(vendor.id, 'approved')}
                                disabled={!!actionLoading}
                                className="p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Setujui"
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                onClick={() => updateVendorStatus(vendor.id, 'rejected')}
                                disabled={!!actionLoading}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Tolak"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                          {vendor.status === 'approved' && vendor.subscription_status !== 'active' && (
                            <button
                              onClick={() => activateSubscription(vendor)}
                              disabled={!!actionLoading}
                              className="text-xs bg-purple-600 text-white px-2.5 py-1 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                              Aktifkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && vendors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400">
                        Tidak ada mitra ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
