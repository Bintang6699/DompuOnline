'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import {
  Shield, ShieldX, AlertTriangle, Eye, Trash2, CheckCircle,
  XCircle, Ban, RefreshCw, Search, Clock, Wifi, Smartphone
} from 'lucide-react'

type TabType = 'suspicious' | 'logs' | 'blocked'

const FLAG_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  spam: { label: 'Potensi Spam', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  duplicate: { label: 'Duplikat', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  high_risk: { label: 'Risiko Tinggi', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  copyright: { label: 'Hak Cipta', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  blocked: { label: 'Diblokir', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

export default function AdminSecurityPage() {
  const [tab, setTab] = useState<TabType>('suspicious')
  const [vendors, setVendors] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [blocked, setBlocked] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [blockForm, setBlockForm] = useState({ type: 'ip', value: '', reason: '' })
  const [showBlockForm, setShowBlockForm] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [suspRes, logRes, blkRes] = await Promise.all([
        fetch('/api/admin/security?type=suspicious'),
        fetch('/api/admin/security?type=logs'),
        fetch('/api/admin/security?type=blocked'),
      ])
      const [suspData, logData, blkData] = await Promise.all([
        suspRes.json(), logRes.json(), blkRes.json()
      ])
      setVendors(suspData.vendors || [])
      setLogs(logData.logs || [])
      setBlocked(blkData.blocked || [])
    } catch (err) {
      console.error('Fetch security data error:', err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const vendorAction = async (vendor_id: string, action: string) => {
    setActionLoading(vendor_id + action)
    try {
      await fetch('/api/admin/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id, action }),
      })
      await fetchData()
    } catch (err) { console.error(err) }
    setActionLoading(null)
  }

  const blockIdentity = async () => {
    if (!blockForm.value.trim()) return
    setActionLoading('block')
    try {
      await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockForm),
      })
      setBlockForm({ type: 'ip', value: '', reason: '' })
      setShowBlockForm(false)
      await fetchData()
    } catch (err) { console.error(err) }
    setActionLoading(null)
  }

  const unblock = async (id: string) => {
    setActionLoading('unblock' + id)
    try {
      await fetch(`/api/admin/security?id=${id}`, { method: 'DELETE' })
      await fetchData()
    } catch (err) { console.error(err) }
    setActionLoading(null)
  }

  const filteredVendors = vendors.filter(v =>
    !search || v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search)
  )

  const TABS = [
    { id: 'suspicious' as TabType, label: 'Mencurigakan', icon: AlertTriangle, count: vendors.length },
    { id: 'logs' as TabType, label: 'Log Keamanan', icon: Clock, count: logs.length },
    { id: 'blocked' as TabType, label: 'Diblokir', icon: Ban, count: blocked.length },
  ]

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-red-500 flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Pusat Keamanan</h1>
                <p className="text-sm text-gray-500">Pantau spam, duplikat, dan ancaman keamanan</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBlockForm(!showBlockForm)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Ban size={15} /> Blokir IP/Perangkat
              </button>
              <button
                onClick={fetchData}
                className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-purple-600 transition-colors"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Block form */}
          {showBlockForm && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Ban size={16} className="text-red-500" /> Blokir IP atau Perangkat
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={blockForm.type}
                  onChange={e => setBlockForm(f => ({ ...f, type: e.target.value }))}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="ip">IP Address</option>
                  <option value="fingerprint">Fingerprint Perangkat</option>
                </select>
                <input
                  value={blockForm.value}
                  onChange={e => setBlockForm(f => ({ ...f, value: e.target.value }))}
                  placeholder={blockForm.type === 'ip' ? '192.168.1.1' : 'fp_abc123...'}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <input
                  value={blockForm.reason}
                  onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Alasan blokir (opsional)"
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={blockIdentity}
                  disabled={actionLoading === 'block'}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Blokir Sekarang
                </button>
                <button
                  onClick={() => setShowBlockForm(false)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Mencurigakan', value: vendors.length, color: 'text-orange-500', bg: 'bg-orange-50', icon: AlertTriangle },
              { label: 'Spam Terdeteksi', value: vendors.filter(v => v.security_flag === 'spam').length, color: 'text-red-500', bg: 'bg-red-50', icon: ShieldX },
              { label: 'Duplikat', value: vendors.filter(v => v.security_flag === 'duplicate').length, color: 'text-purple-500', bg: 'bg-purple-50', icon: Eye },
              { label: 'IP/Perangkat Diblokir', value: blocked.length, color: 'text-gray-700', bg: 'bg-gray-100', icon: Ban },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={15} className={color} />
                </div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
            {TABS.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={14} />
                {label}
                {count > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Suspicious vendors tab */}
          {tab === 'suspicious' && (
            <>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari nama, pemilik, atau nomor..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Mitra</th>
                        <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Flag</th>
                        <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Skor Spam</th>
                        <th className="text-left px-4 py-3.5 font-semibold text-gray-600">IP / Fingerprint</th>
                        <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 5 }).map((_, j) => (
                              <td key={j} className="px-5 py-4">
                                <div className="h-4 skeleton rounded w-24" />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : filteredVendors.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-400">
                            <Shield size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Tidak ada pendaftaran mencurigakan</p>
                          </td>
                        </tr>
                      ) : filteredVendors.map((vendor) => {
                        const flagCfg = vendor.security_flag ? FLAG_CONFIG[vendor.security_flag] : null
                        return (
                          <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-gray-800">{vendor.name}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {vendor.owner_name} · {vendor.phone}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              {flagCfg ? (
                                <span
                                  className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide"
                                  style={{ color: flagCfg.color, background: flagCfg.bg }}
                                >
                                  {flagCfg.label}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-orange-600 font-bold">Spam</span>
                                  <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                                      style={{ width: `${vendor.spam_score || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-gray-500">{vendor.spam_score || 0}%</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-purple-600 font-bold">Duplik.</span>
                                  <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                                      style={{ width: `${vendor.duplicate_score || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-gray-500">{vendor.duplicate_score || 0}%</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                {vendor.ip_address && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                    <Wifi size={10} /> {vendor.ip_address}
                                  </div>
                                )}
                                {vendor.fingerprint_id && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                    <Smartphone size={10} /> {vendor.fingerprint_id.slice(0, 16)}...
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => vendorAction(vendor.id, 'approve')}
                                  disabled={!!actionLoading}
                                  className="p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                  title="Setujui"
                                >
                                  <CheckCircle size={15} />
                                </button>
                                <button
                                  onClick={() => vendorAction(vendor.id, 'mark_spam')}
                                  disabled={!!actionLoading}
                                  className="p-1.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                  title="Tandai Spam"
                                >
                                  <AlertTriangle size={15} />
                                </button>
                                <button
                                  onClick={() => vendorAction(vendor.id, 'reject')}
                                  disabled={!!actionLoading}
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Tolak"
                                >
                                  <XCircle size={15} />
                                </button>
                                {vendor.ip_address && (
                                  <button
                                    onClick={async () => {
                                      setActionLoading('block-ip-' + vendor.id)
                                      await fetch('/api/admin/security', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ type: 'ip', value: vendor.ip_address, reason: 'Blocked from suspicious vendor' }),
                                      })
                                      await fetchData()
                                      setActionLoading(null)
                                    }}
                                    disabled={!!actionLoading}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Blokir IP"
                                  >
                                    <Ban size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Logs tab */}
          {tab === 'logs' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Event</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600">IP Address</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Detail</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>{Array.from({length:4}).map((_,j) => <td key={j} className="px-5 py-4"><div className="h-4 skeleton rounded w-24"/></td>)}</tr>
                      ))
                    ) : logs.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-12 text-gray-400">Belum ada log keamanan</td></tr>
                    ) : logs.map(log => {
                      const isSpam = log.event_type.includes('spam') || log.event_type.includes('blocked')
                      return (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wide ${
                              isSpam ? 'bg-red-50 text-red-600' : log.event_type.includes('success') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {log.event_type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{log.ip_address || '—'}</td>
                          <td className="px-4 py-3.5 text-xs text-gray-600 max-w-xs truncate">
                            {log.details?.name && <span className="font-medium">{log.details.name}</span>}
                            {log.details?.spam_score !== undefined && (
                              <span className="ml-2 text-orange-500">spam:{log.details.spam_score}</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-gray-400">
                            {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Blocked tab */}
          {tab === 'blocked' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Tipe</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Nilai</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Alasan</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Diblokir Oleh</th>
                      <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>{Array.from({length:5}).map((_,j) => <td key={j} className="px-5 py-4"><div className="h-4 skeleton rounded w-24"/></td>)}</tr>
                      ))
                    ) : blocked.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-gray-400">Tidak ada yang diblokir</td></tr>
                    ) : blocked.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {b.type === 'ip' ? <Wifi size={13} className="text-blue-500" /> : <Smartphone size={13} className="text-purple-500" />}
                            <span className="text-[10px] font-black uppercase text-gray-600">{b.type === 'ip' ? 'IP Address' : 'Perangkat'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-700">{b.value}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{b.reason || '—'}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">{b.blocked_by}</td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => unblock(b.id)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors ml-auto"
                          >
                            <Trash2 size={12} /> Hapus Blokir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
