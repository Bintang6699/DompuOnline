'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { Users, CheckCircle, Clock, XCircle, CreditCard, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { CATEGORIES } from '@/lib/categories'

interface Stats {
  total: number
  approved: number
  pending: number
  rejected: number
  activeSubscriptions: number
  revenue: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0, approved: 0, pending: 0, rejected: 0, activeSubscriptions: 0, revenue: 0
  })
  const [recentVendors, setRecentVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Use admin API to bypass RLS — fetches ALL vendors including pending
        const params = new URLSearchParams()
        if (categoryFilter) params.set('category', categoryFilter)
        
        const vendorsRes = await fetch(`/api/admin/vendors?${params.toString()}`, { cache: 'no-store' })
        const vendorsJson = await vendorsRes.json()
        const vendors = vendorsJson.vendors || []

        // Fetch subscriptions via admin API
        const subsRes = await fetch('/api/admin/subscriptions', { cache: 'no-store' })
        const subsJson = await subsRes.json()
        const subs = subsJson.subscriptions || []

        setStats({
          total: vendors.length,
          approved: vendors.filter((v: any) => v.status === 'approved').length,
          pending: vendors.filter((v: any) => v.status === 'pending').length,
          rejected: vendors.filter((v: any) => v.status === 'rejected').length,
          activeSubscriptions: subs.filter((s: any) => s.status === 'active').length,
          revenue: subs.filter((s: any) => s.status === 'active').reduce((sum: number, s: any) => sum + (s.amount_paid || 0), 0),
        })

        // Recent vendors = first 5 from vendors list
        setRecentVendors(vendors.slice(0, 5))
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      }
      setLoading(false)
    }
    fetchData()
  }, [categoryFilter])

  const statCards = [
    { label: 'Total Mitra', value: stats.total, icon: Users, color: 'from-purple-500 to-purple-700', sub: 'Semua status' },
    { label: 'Aktif', value: stats.approved, icon: CheckCircle, color: 'from-green-500 to-green-700', sub: 'Terverifikasi' },
    { label: 'Menunggu', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-orange-500', sub: 'Perlu review' },
    { label: 'Langganan Aktif', value: stats.activeSubscriptions, icon: CreditCard, color: 'from-blue-500 to-blue-700', sub: 'Berbayar' },
  ]

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Selamat datang di Admin Panel DompuOnline</p>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-4 py-2">
              <Sparkles size={16} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">
                Revenue: {formatCurrency(stats.revenue)}
              </span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex gap-2 mb-8 p-1.5 bg-white rounded-2xl w-fit shadow-sm border border-gray-100 overflow-x-auto max-w-full">
            <button
              onClick={() => setCategoryFilter('')}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                categoryFilter === '' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Semua
            </button>
            {CATEGORIES.filter(c => ['transport', 'food', 'shopping', 'services'].includes(c.slug)).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategoryFilter(cat.slug)}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  categoryFilter === cat.slug ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{loading ? '–' : stat.value}</p>
                  <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
                  <p className="text-xs text-gray-400">{stat.sub}</p>
                </div>
              )
            })}
          </div>

          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300 mb-1">Total Revenue Aktif</p>
                <p className="text-3xl font-black">{formatCurrency(stats.revenue)}</p>
                <p className="text-sm text-purple-300 mt-1">dari {stats.activeSubscriptions} langganan aktif</p>
              </div>
              <TrendingUp size={48} className="text-white/30" />
            </div>
          </div>

          {/* Recent Vendors */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Mitra Terbaru</h2>
              <Link href="/admin/vendors" className="text-sm text-purple-600 font-semibold hover:underline">
                Lihat semua →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{vendor.name}</p>
                    <p className="text-xs text-gray-400">{vendor.owner_name} · {vendor.categories?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold badge-${vendor.status}`}>
                      {vendor.status === 'pending' ? 'Menunggu' : vendor.status === 'approved' ? 'Aktif' : 'Ditolak'}
                    </span>
                    <Link href={`/admin/vendors/${vendor.id}`} className="text-xs text-purple-600 font-semibold hover:underline">
                      Detail
                    </Link>
                  </div>
                </div>
              ))}
              {recentVendors.length === 0 && !loading && (
                <p className="text-center py-8 text-gray-400 text-sm">Belum ada mitra terdaftar</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
