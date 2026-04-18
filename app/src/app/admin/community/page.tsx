'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, RefreshCw, MessageCircle, ExternalLink, Globe } from 'lucide-react'

export default function AdminCommunityPage() {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchLinks = async () => {
    setLoading(true)
    const { data } = await supabase.from('community_links').select('*').order('created_at', { ascending: true })
    setLinks(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchLinks() }, [])

  const handleUpdate = async (id: string, url: string) => {
    setSaving(true)
    await supabase.from('community_links').update({ url }).eq('id', id)
    setSaving(false)
    await fetchLinks()
  }

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'whatsapp_group': return <MessageCircle className="text-green-500" />
      case 'whatsapp_channel': return <MessageCircle className="text-blue-500" />
      case 'facebook_group': return <Globe className="text-blue-600" />
      default: return <ExternalLink />
    }
  }

  const getPlatformLabel = (platform: string) => {
    switch(platform) {
      case 'whatsapp_group': return 'Grup WhatsApp'
      case 'whatsapp_channel': return 'Saluran WhatsApp'
      case 'facebook_group': return 'Grup Facebook'
      default: return platform
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Komunitas Dompu Online</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">Kelola tautan komunitas yang muncul di halaman beranda.</p>
            </div>
            <button onClick={fetchLinks} className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-purple-600 transition-all hover:shadow-sm">
              <RefreshCw size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="bg-white h-32 rounded-[32px] animate-pulse" />)
            ) : (
              links.map((link) => (
                <div key={link.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                      {getPlatformIcon(link.platform)}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">{getPlatformLabel(link.platform)}</h2>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Update URL Tautan</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      defaultValue={link.url}
                      onBlur={(e) => handleUpdate(link.id, e.target.value)}
                      placeholder="Masukkan URL tautan..."
                      className="flex-1 text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                    <button 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-purple-200 disabled:opacity-50"
                      disabled={saving}
                    >
                      <Save size={18} />
                      Simpan
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-12 bg-indigo-900 rounded-[40px] p-10 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
             <div className="relative z-10 flex items-center gap-8">
                <div className="flex-1">
                   <h3 className="text-2xl font-black mb-3">Tips Komunitas</h3>
                   <p className="text-indigo-100/70 text-sm leading-relaxed font-medium">
                      Pastikan URL yang Anda masukkan valid (dimulai dengan https://). 
                      Tautan komunitas akan membantu pengguna mendapatkan pengumuman terbaru dan update fitur langsung dari Anda.
                   </p>
                </div>
                <div className="hidden md:block">
                   <Globe size={80} className="text-indigo-700 opacity-50" />
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
