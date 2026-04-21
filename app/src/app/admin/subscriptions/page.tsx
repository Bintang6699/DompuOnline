'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { formatDate, getSubscriptionLabel, getSubscriptionPrice, formatCurrency } from '@/lib/utils'
import { getSettings, updateSettings } from '@/app/actions/settings'
import { CreditCard, RefreshCw, TrendingUp, Clock, Gift } from 'lucide-react'

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const end = new Date(endDate).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${d}h ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const int = setInterval(updateTimer, 1000)
    return () => clearInterval(int)
  }, [endDate])

  if (timeLeft === 'Expired') return null
  
  return (
    <span className="font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-tight inline-flex items-center gap-1">
      <Clock size={10} /> {timeLeft}
    </span>
  )
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, active: 0, revenue: 0 })
  const [activeTab, setActiveTab] = useState<'active' | 'expiring' | 'inactive'>('active')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Settings for Free Trial
  const [settingsData, setSettingsData] = useState<any>(null)
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false)

  const getRemainingDays = (endDate?: string) => {
    if (!endDate) return -999
    const diff = new Date(endDate).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // Load Settings
      const sData = await getSettings()
      setSettingsData(sData)

      const res = await fetch('/api/admin/subscriptions', { cache: 'no-store' })
      const json = await res.json()
      const subs = json.subscriptions || []
      
      // Auto-expire logic locally (if any)
      for (const sub of subs) {
        if (sub.status === 'active' && getRemainingDays(sub.end_date) <= 0) {
          await fetch('/api/admin/subscriptions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: sub.id,
              vendor_id: sub.vendor_id,
              updates: { status: 'expired' },
              vendorUpdates: { subscription_status: 'expired' }
            })
          })
          sub.status = 'expired'
        }
      }

      setSubscriptions(subs)
      setStats({
        total: subs.length,
        active: subs.filter((s: any) => s.status === 'active').length,
        revenue: subs.filter((s: any) => s.status === 'active').reduce((sum: number, s: any) => sum + (s.amount_paid || 0), 0),
      })
    } catch (err) {
      console.error('Fetch subscriptions error', err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleToggleFreeTrial = async () => {
    setIsUpdatingSettings(true)
    
    const newValue = !settingsData?.enableFreeTrial
    const newSettings = { ...(settingsData || {}), enableFreeTrial: newValue }
    const res = await updateSettings(newSettings)
    
    if (res.success) {
      setSettingsData(newSettings)
    } else {
      alert('Gagal mengupdate: ' + (res.error || 'Unknown error'))
    }
    setIsUpdatingSettings(false)
  }

  const handleUpdateSubscription = async (sub: any, newPlan: string) => {
    setActionLoading(sub.id)
    const months: Record<string, number> = { 'free_2_month': 2, '1_month': 1, '3_month': 3, '6_month': 6, '1_year': 12 }
    const now = new Date()
    const currentEnd = sub.end_date ? new Date(sub.end_date) : now
    const baseDate = currentEnd > now ? currentEnd : now
    
    const newEnd = new Date(baseDate)
    newEnd.setMonth(newEnd.getMonth() + (months[newPlan] || 1))

    const amount = newPlan === 'free_2_month' ? 0 : getSubscriptionPrice(newPlan)

    try {
      await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sub.id,
          vendor_id: sub.vendor_id,
          updates: {
            plan: newPlan,
            end_date: newEnd.toISOString(),
            start_date: now.toISOString(),
            status: 'active',
            amount_paid: amount
          },
          vendorUpdates: {
            subscription_status: 'active',
            subscription_end: newEnd.toISOString(),
          }
        })
      })
    } catch (err) {
      console.error(err)
    }
    
    await fetchData()
    setActionLoading(null)
  }

  const handleToggleStatus = async (sub: any) => {
    setActionLoading(sub.id)
    const newStatus = sub.status === 'active' ? 'expired' : 'active'
    
    try {
      await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sub.id,
          vendor_id: sub.vendor_id,
          updates: { status: newStatus },
          vendorUpdates: { subscription_status: newStatus }
        })
      })
    } catch (err) {
      console.error(err)
    }

    await fetchData()
    setActionLoading(null)
  }

  const filteredSubs = subscriptions.filter(sub => {
    const days = getRemainingDays(sub.end_date)
    if (activeTab === 'active') return sub.status === 'active' && days > 4
    if (activeTab === 'expiring') return sub.status === 'active' && days <= 4 && days > 0
    if (activeTab === 'inactive') return sub.status === 'expired' || days <= 0
    return true
  })

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">Manajemen Langganan</h1>
              <p className="text-sm text-gray-500 font-medium">Kelola masa aktif dan paket pelanggan</p>
            </div>
            <button onClick={fetchData} className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-purple-600 transition-colors shadow-sm">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Toggle Free Trial Card */}
          <div className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 shadow-lg shadow-purple-500/20 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Gift size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Promo Langganan Gratis 2 Bulan</h2>
                <p className="text-purple-100 text-sm font-medium">Aktifkan untuk memunculkan paket gratis saat mitra mendaftar.</p>
              </div>
            </div>
            
            <button
              onClick={handleToggleFreeTrial}
              disabled={isUpdatingSettings || !settingsData}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${
                settingsData?.enableFreeTrial ? 'bg-green-400' : 'bg-white/20'
              }`}
            >
              <span className="sr-only">Toggle Free Trial</span>
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settingsData?.enableFreeTrial ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Mitra', value: stats.total, icon: CreditCard, color: 'text-purple-600 bg-purple-50 border-purple-100' },
              { label: 'Langganan Aktif', value: stats.active, icon: TrendingUp, color: 'text-green-600 bg-green-50 border-green-100' },
              { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: TrendingUp, color: 'text-blue-600 bg-blue-100' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 border ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Custom Navigation Tabs */}
          <div className="flex gap-2 mb-6 p-1.5 bg-gray-100 rounded-2xl w-fit">
            {[
              { id: 'active', label: 'Masa Aktif', count: subscriptions.filter(s => getRemainingDays(s.end_date) > 4 && s.status === 'active').length },
              { id: 'expiring', label: 'Masa Hampir Habis', count: subscriptions.filter(s => getRemainingDays(s.end_date) <= 4 && getRemainingDays(s.end_date) > 0 && s.status === 'active').length },
              { id: 'inactive', label: 'Mitra Nonaktif', count: subscriptions.filter(s => s.status === 'expired' || getRemainingDays(s.end_date) <= 0).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Performance Optimized Table */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Mitra Pelanggan</th>
                    <th className="text-left px-4 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Kategori</th>
                    <th className="text-left px-4 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Pilihan Paket</th>
                    <th className="text-left px-4 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Status / Countdown</th>
                    <th className="text-right px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Kelola Paket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={4} className="px-6 py-8"><div className="h-4 w-full skeleton rounded-full" /></td></tr>
                    ))
                  ) : filteredSubs.map((sub) => {
                    const days = getRemainingDays(sub.end_date)
                    const isExpired = sub.status === 'expired' || days <= 0
                    
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-black text-gray-900 text-base">{sub.vendors?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <p className="text-xs font-bold text-gray-400">{sub.vendors?.owner_name}</p>
                             <span className="w-1 h-1 bg-gray-200 rounded-full" />
                             <p className="text-xs font-bold text-purple-400">{sub.vendors?.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-5 font-bold text-xs text-purple-600 uppercase">
                          {sub.vendors?.categories?.name || '-'}
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex flex-col gap-1">
                             <span className="text-xs font-black text-gray-700 bg-gray-100 w-fit px-2 py-1 rounded-lg">
                               {getSubscriptionLabel(sub.plan)}
                             </span>
                             <p className="text-[10px] font-bold text-gray-400 pl-1">
                               {sub.start_date ? `Aktif sejak: ${formatDate(sub.start_date)}` : 'Belum aktif'}
                             </p>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="space-y-2">
                             {sub.status === 'active' ? (
                               <div className="flex flex-col gap-1.5">
                                 <div className={`text-[10px] font-black px-2 py-0.5 rounded-full w-fit border ${
                                   days <= 4 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                                 }`}>
                                   {days <= 4 ? 'ALMOST EXPIRED ⚠️' : 'AKTIF BERJALAN ✓'}
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <CountdownTimer endDate={sub.end_date} />
                                   <span className="text-[10px] font-bold text-gray-400">({days} Hari lagi)</span>
                                 </div>
                               </div>
                             ) : (
                               <div className="flex flex-col gap-1">
                                 <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full w-fit border border-gray-200">
                                   NONAKTIF / EXPIRED
                                 </span>
                                 <p className="text-[10px] font-bold text-red-400 pl-1">Berakhir: {formatDate(sub.end_date)}</p>
                               </div>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-3">
                            <select 
                              defaultValue={sub.plan}
                              id={`plan-${sub.id}`}
                              className="text-[11px] font-bold bg-white border border-gray-200 rounded-xl px-2 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
                            >
                               <option value="1_month">1 Bulan - Rp 9.900</option>
                               <option value="3_month">3 Bulan - Rp 30.000</option>
                               <option value="6_month">6 Bulan - Rp 179.000</option>
                               <option value="1_year">1 Tahun - Rp 499.000</option>
                            </select>
                            <button
                              onClick={() => {
                                const select = document.getElementById(`plan-${sub.id}`) as HTMLSelectElement
                                handleUpdateSubscription(sub, select.value)
                              }}
                              disabled={actionLoading === sub.id}
                              className="btn-primary text-white text-[11px] font-black px-4 py-2.5 rounded-xl shadow-lg shadow-purple-200 disabled:opacity-50"
                            >
                               {sub.status === 'active' ? 'Perbarui' : 'Aktifkan Kembali'}
                            </button>
                            <button
                              onClick={() => handleToggleStatus(sub)}
                              disabled={actionLoading === sub.id}
                              className={`text-[11px] font-black px-4 py-2.5 rounded-xl transition-all border ${
                                sub.status === 'active' 
                                  ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                                  : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                              }`}
                            >
                              {sub.status === 'active' ? 'Nonaktifkan' : 'Resume'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {!loading && filteredSubs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-20 bg-gray-50/30">
                        <div className="flex flex-col items-center">
                          <span className="text-4xl mb-3 opacity-50">📂</span>
                          <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Kosong di kategori ini</p>
                        </div>
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
