'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { getSettings, updateSettings } from '@/app/actions/settings'
import { Save, Phone, MapPin, Mail, Camera, CheckCircle } from 'lucide-react'

export default function AdminContactPage() {
  const [formData, setFormData] = useState({
    whatsapp: '',
    instagram: '',
    email: '',
    tiktok: '',
    address: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getSettings().then(data => {
      setFormData(data)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await updateSettings(formData)
    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      alert('Gagal menyimpan: ' + (res.error || 'Unknown error'))
    }
    setSaving(false)
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900">Pengaturan Kontak & Admin</h1>
            <p className="text-sm text-gray-500">Kelola nomor WA admin, Alamat Kantor, dan Media Sosial Platform DompuOnline yang akan ditampilkan ke publik.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-10 bg-gray-100 skeleton rounded-xl" />
                <div className="h-10 bg-gray-100 skeleton rounded-xl" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1">
                    <Phone size={16} className="text-green-500" /> Nomor WhatsApp Admin
                  </label>
                  <p className="text-xs text-gray-400 mb-2">Gunakan format awalan kode negara tanpa plus (Contoh: 62812345678)</p>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="628..."
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1">
                    <Mail size={16} className="text-blue-500" /> Email Resmi
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="admin@dompuonline.id"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1">
                    <Camera size={16} className="text-pink-500" /> Link Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1">
                    <span className="font-black">🎵</span> Link TikTok
                  </label>
                  <input
                    type="url"
                    value={formData.tiktok}
                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://tiktok.com/@..."
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-red-500" /> Link Alamat (Maps)
                  </label>
                  <p className="text-xs text-gray-400 mb-2">Masukkan URL Google Maps / tautan lokasi.</p>
                  <input
                    type="url"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://maps.app.goo.gl/..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2"
                  >
                    <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  {success && (
                    <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                      <CheckCircle size={18} /> Tersimpan!
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
