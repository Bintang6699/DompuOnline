'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, X, RefreshCw, StopCircle, PlayCircle, Newspaper, User, Image as ImageIcon, Video, Link as LinkIcon } from 'lucide-react'
import { MediaUpload } from '@/components/admin/MediaUpload'
import Image from 'next/image'

export default function AdminSlidersPage() {
  const [sliders, setSliders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [availableVendors, setAvailableVendors] = useState<any[]>([])
  const [filteredVendors, setFilteredVendors] = useState<any[]>([])
  const [availableNews, setAvailableNews] = useState<any[]>([])
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState('')
  const [vendorSearch, setVendorSearch] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'image' as 'image' | 'video',
    image_url: '',
    video_url: '',
    vendor_id: '',
    news_id: '',
    is_active: true,
  })

  const fetchSliders = async () => {
    setLoading(true)
    try {
      const [slidersRes, vendorsRes, newsRes] = await Promise.all([
        fetch('/api/admin/sliders').then(res => res.json()),
        fetch('/api/admin/vendors?status=approved').then(res => res.json()),
        fetch('/api/admin/news').then(res => res.json())
      ])
      setSliders(slidersRes.sliders || [])
      setAvailableVendors(vendorsRes.vendors || [])
      setFilteredVendors(vendorsRes.vendors || [])
      setAvailableNews(newsRes.news || [])
    } catch (error) {
      console.error('Error fetching sliders or dependencies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = availableVendors
    if (vendorCategoryFilter) {
      filtered = filtered.filter(v => v.categories?.slug === vendorCategoryFilter)
    }
    if (vendorSearch) {
      filtered = filtered.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
    }
    setFilteredVendors(filtered)
  }, [vendorCategoryFilter, vendorSearch, availableVendors])

  useEffect(() => { fetchSliders() }, [])

  const handleSave = async () => {
    // If not linking to vendor/news, media is required
    if (!formData.vendor_id && !formData.image_url && !formData.video_url) {
      alert('Silakan masukkan gambar atau video atau pilih mitra.')
      return
    }
    
    setSaving(true)
    
    try {
      const res = await fetch('/api/admin/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          image_url: formData.type === 'image' ? formData.image_url : '',
          video_url: formData.type === 'video' ? formData.video_url : '',
          vendor_id: formData.vendor_id || null,
          news_id: formData.news_id || null,
          is_active: formData.is_active,
        })
      })

      if (!res.ok) throw new Error('Failed to save slider')
      
      setFormData({ title: '', type: 'image', image_url: '', video_url: '', vendor_id: '', news_id: '', is_active: true })
      setShowForm(false)
      await fetchSliders()
    } catch (error) {
      console.error('Error saving slider:', error)
      alert('Gagal menyimpan slider')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus banner ini?')) return
    try {
      const res = await fetch(`/api/admin/sliders?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete slider')
      await fetchSliders()
    } catch (error) {
      console.error('Error deleting slider:', error)
      alert('Gagal menghapus slider')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/sliders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus })
      })
      if (!res.ok) throw new Error('Failed to toggle status')
      await fetchSliders()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Slider Banner</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">Buat promo visual yang memukau untuk beranda.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchSliders} className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-purple-600 transition-all hover:shadow-sm">
                <RefreshCw size={20} />
              </button>
              <button
                onClick={() => { setShowForm(true); setFormData({ title: '', type: 'image', image_url: '', video_url: '', vendor_id: '', news_id: '', is_active: true }) }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
              >
                <Plus size={18} /> Tambah Banner
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/50 border border-gray-50 mb-10 animate-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Konfigurasi Banner Baru</h2>
                  <p className="text-xs text-gray-400 mt-1">Isi informasi yang akan ditampilkan di slider utama.</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Judul Banner (Opsional)</label>
                    <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: Promo Ramadhan" className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Tipe Media</label>
                    <div className="flex gap-2">
                       <button onClick={() => setFormData({...formData, type: 'image'})} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all font-bold text-sm ${formData.type === 'image' ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
                          <ImageIcon size={18} /> Gambar
                       </button>
                       <button onClick={() => setFormData({...formData, type: 'video'})} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all font-bold text-sm ${formData.type === 'video' ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
                          <Video size={18} /> Video
                       </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-[24px] p-6 border border-gray-100">
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-4">Pilih Salah Satu Media</p>
                  <div className="space-y-4">
                    <div className={`${formData.type !== 'image' && 'opacity-40 grayscale pointer-events-none'}`}>
                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Upload / URL Gambar</label>
                       <div className="space-y-3">
                         <div className="relative">
                           <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                           <input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value, type: 'image' })}
                              placeholder="https://... (URL Gambar)" className="w-full text-sm font-semibold bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                         </div>
                         <MediaUpload type="image" onUploadSuccess={(url) => setFormData({ ...formData, image_url: url, type: 'image' })} />
                       </div>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                       <div className="flex-1 h-px bg-gray-200" />
                       <span className="text-[10px] font-black text-gray-300 uppercase">Atau</span>
                       <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className={`${formData.type !== 'video' && 'opacity-40 grayscale pointer-events-none'}`}>
                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Upload / URL Video</label>
                       <div className="space-y-3">
                         <div className="relative">
                           <Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                           <input value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value, type: 'video' })}
                              placeholder="https://... (URL Video)" className="w-full text-sm font-semibold bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                         </div>
                         <MediaUpload type="video" onUploadSuccess={(url) => setFormData({ ...formData, video_url: url, type: 'video' })} />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="bg-purple-50/50 rounded-[24px] p-6 border border-purple-100/50">
                    <label className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 block">Tautkan ke Mitra (Opsional)</label>
                    
                    <div className="flex gap-2 mb-3">
                       <select 
                          value={vendorCategoryFilter} 
                          onChange={(e) => setVendorCategoryFilter(e.target.value)}
                          className="text-[10px] font-bold bg-white border border-purple-100 rounded-xl px-3 py-2 outline-none"
                       >
                          <option value="">Semua Kategori</option>
                          <option value="transport">Transportasi</option>
                          <option value="food">Kuliner</option>
                          <option value="shopping">Belanja</option>
                          <option value="services">Jasa</option>
                       </select>
                       <input 
                          value={vendorSearch}
                          onChange={(e) => setVendorSearch(e.target.value)}
                          placeholder="Cari mitra..."
                          className="flex-1 text-[10px] font-bold bg-white border border-purple-100 rounded-xl px-3 py-2 outline-none"
                       />
                    </div>

                    <select
                      value={formData.vendor_id}
                      onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value, news_id: '' })}
                      className="w-full text-sm border font-bold border-purple-200 bg-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all appearance-none"
                    >
                      <option value="">-- Tidak Ada Tautan --</option>
                      {filteredVendors.map((v) => (
                        <option key={v.id} value={v.id}>{v.name} ({v.categories?.name})</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-purple-400 mt-2 font-medium italic">* Jika memilih mitra, gambar/video bisa dikosongkan (opsional)</p>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Tautkan ke Berita (Opsional)</label>
                    <select
                      value={formData.news_id}
                      onChange={(e) => setFormData({ ...formData, news_id: e.target.value, vendor_id: '' })}
                      className="w-full text-sm border font-bold border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all appearance-none"
                    >
                      <option value="">-- Tidak Ada Tautan --</option>
                      {availableNews.map((n) => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-12 h-6 rounded-full p-1 transition-all ${formData.is_active ? 'bg-purple-600' : 'bg-gray-200'}`}>
                         <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                      <span className="text-sm font-black text-gray-700 uppercase tracking-tight">Tampilkan di Beranda</span>
                   </label>

                   <div className="flex gap-4">
                      <button onClick={() => setShowForm(false)} className="px-8 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all">Batal</button>
                      <button onClick={handleSave} disabled={saving} className="px-12 py-4 bg-purple-600 text-white font-black rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all disabled:bg-gray-200">
                        {saving ? 'Menyimpan...' : 'Publikasikan'}
                      </button>
                   </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white h-48 rounded-[32px] animate-pulse" />
              ))
            ) : sliders.length === 0 ? (
              <div className="col-span-2 text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🖼️</div>
                <p className="font-black text-gray-900 text-xl">Belum ada slider yang dibuat</p>
                <p className="text-gray-400 text-sm mt-2">Buat promosi pertama Anda untuk memikat pengunjung.</p>
              </div>
            ) : (
              sliders.map((slider) => {
                const vendorMedia = slider.vendors?.media?.find((m: any) => m.type === 'image' || m.type === 'thumb') || slider.vendors?.media?.[0]
                const displayType = slider.image_url || slider.video_url ? slider.type : (vendorMedia?.type || slider.type || 'image')
                const displayUrl = (slider.type === 'video' ? (slider.video_url || vendorMedia?.url) : (slider.image_url || vendorMedia?.url)) || ''
                
                return (
                  <div key={slider.id} className="group bg-white rounded-[32px] p-5 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 border border-gray-50 transition-all duration-300">
                    <div className="relative aspect-[21/10] rounded-2xl overflow-hidden mb-5 bg-black">
                      {displayType === 'video' && displayUrl ? (
                        <video src={displayUrl} className="w-full h-full object-cover opacity-80" muted />
                      ) : (
                        <Image src={displayUrl || '/placeholder-banner.jpg'} alt="Slider" fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized={!!displayUrl && !displayUrl.startsWith('http')} />
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                         <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg text-white shadow-xl backdrop-blur-md uppercase tracking-widest ${slider.is_active ? 'bg-green-500/80' : 'bg-gray-900/80'}`}>
                          {slider.is_active ? 'Aktif' : 'Draft'}
                        </span>
                        <span className="text-[10px] font-black px-3 py-1.5 rounded-lg text-white shadow-xl backdrop-blur-md uppercase tracking-widest bg-purple-600/80">
                          {displayType}
                        </span>
                        {(!slider.image_url && !slider.video_url) && slider.vendor_id && (
                          <span className="text-[10px] font-black px-3 py-1.5 rounded-lg text-white shadow-xl backdrop-blur-md uppercase tracking-widest bg-blue-600/80 shadow-blue-200">
                            Auto-Mitra
                          </span>
                        )}
                      </div>
                    </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-gray-900 uppercase tracking-tight truncate">
                         {slider.title || 'Tanpa Judul Banner'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                         {slider.vendor_id ? (
                           <div className="flex items-center gap-1 text-[10px] font-black text-purple-600 uppercase">
                              <User size={12} /> {slider.vendors?.name}
                           </div>
                         ) : slider.news_id ? (
                           <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase">
                              <Newspaper size={12} /> Berita Terkait
                           </div>
                         ) : (
                           <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                              <LinkIcon size={12} /> Tidak Ada Tautan
                           </div>
                         )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => toggleActive(slider.id, slider.is_active)} className={`p-3 rounded-2xl transition-all ${slider.is_active ? 'bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}>
                        {slider.is_active ? <StopCircle size={18} /> : <PlayCircle size={18} />}
                      </button>
                      <button onClick={() => handleDelete(slider.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          </div>
        </div>
      </main>
    </div>
  )
}

