'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, RefreshCw, Image as ImageIcon, Video, Upload } from 'lucide-react'
import { MediaUpload } from '@/components/admin/MediaUpload'

export default function AdminNewsPage() {
  const [newsItems, setNewsItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    author: '', 
    category: '', 
    media: [] as { type: 'image' | 'video', url: string }[] 
  })
  const [newMedia, setNewMedia] = useState({ type: 'image' as 'image' | 'video', url: '' })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const fetchNews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/news')
      const data = await res.json()
      setNewsItems(data.news || [])
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return
    setSaving(true)
    
    try {
      const res = await fetch('/api/admin/news', {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId,
          title: formData.title,
          content: formData.content,
          author: formData.author,
          category: formData.category,
          media: formData.media
        })
      })

      if (!res.ok) throw new Error('Failed to save news')

      setFormData({ title: '', content: '', author: '', category: '', media: [] })
      setShowForm(false)
      setEditId(null)
      await fetchNews()
    } catch (error) {
      console.error('Error saving news:', error)
      alert('Gagal menyimpan berita')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: any) => {
    setFormData({ 
      title: item.title, 
      content: item.content, 
      author: item.author || '', 
      category: item.category || '', 
      media: item.media || [] 
    })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus berita ini?')) return
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete news')
      await fetchNews()
    } catch (error) {
      console.error('Error deleting news:', error)
      alert('Gagal menghapus berita')
    }
  }

  const addMediaRow = () => {
    if (!newMedia.url.trim()) return
    setFormData({ ...formData, media: [...formData.media, { ...newMedia }] })
    setNewMedia({ type: 'image', url: '' })
  }

  const removeMediaRow = (index: number) => {
    const updated = [...formData.media]
    updated.splice(index, 1)
    setFormData({ ...formData, media: updated })
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Manajemen Berita</h1>
              <p className="text-gray-500 text-sm mt-1">Kelola berita dan informasi terbaru untuk warga Dompu.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchNews} className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-purple-600 transition-all hover:shadow-sm">
                <RefreshCw size={20} />
              </button>
              <button onClick={() => { setShowForm(true); setEditId(null); setFormData({ title: '', content: '', author: '', category: '', media: [] }) }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-200 transition-all">
                <Plus size={18} /> Tambah Berita
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/50 border border-gray-50 mb-10 animate-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-black text-gray-900">{editId ? 'Edit Berita' : 'Berita Baru'}</h2>
                  <p className="text-xs text-gray-400 mt-1">Lengkapi informasi berita berikut.</p>
                </div>
                <button onClick={() => { setShowForm(false); setEditId(null) }} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Judul Berita</label>
                    <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Masukkan judul yang menarik..." className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Penulis</label>
                    <input value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})}
                      placeholder="Nama penulis" className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Kategori</label>
                    <input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="Contoh: Kuliner, Wisata, UMKM" className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                </div>

                <div>
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Media (Gambar/Video)</label>
                   <div className="space-y-3 mb-4">
                     {formData.media.map((m, idx) => (
                       <div key={idx} className="flex items-center gap-3 bg-purple-50 p-3 rounded-xl border border-purple-100">
                         <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                           {m.type === 'image' ? <ImageIcon size={20} /> : <Video size={20} />}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-[10px] font-black text-purple-400 uppercase">{m.type}</p>
                           <p className="text-sm font-semibold text-purple-900 truncate">{m.url}</p>
                         </div>
                         <button onClick={() => removeMediaRow(idx)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                       </div>
                     ))}
                   </div>
                   
                    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex gap-3">
                        <select 
                          value={newMedia.type}
                          onChange={(e) => setNewMedia({...newMedia, type: e.target.value as 'image' | 'video'})}
                          className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
                        >
                          <option value="image">Gambar</option>
                          <option value="video">Video</option>
                        </select>
                        <input 
                          value={newMedia.url}
                          onChange={(e) => setNewMedia({...newMedia, url: e.target.value})}
                          placeholder="Masukkan URL media..."
                          className="flex-1 text-sm font-semibold bg-white border border-gray-100 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                        />
                        <button onClick={addMediaRow} className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2">
                          <Plus size={18} /> Tambah URL
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] font-black text-gray-400 uppercase">Atau Upload File</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      <MediaUpload 
                        type={newMedia.type} 
                        onUploadSuccess={(url) => {
                          setFormData({ ...formData, media: [...formData.media, { type: newMedia.type, url }] })
                        }} 
                      />
                    </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Isi Berita</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Tulis isi berita secara lengkap di sini..." rows={10}
                    className="w-full text-sm font-medium bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none" />
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-100 transition-all disabled:bg-gray-200 disabled:shadow-none">
                    {saving ? 'Sedang Menyimpan...' : editId ? 'Perbarui Berita' : 'Publikasikan Berita'}
                  </button>
                  <button onClick={() => { setShowForm(false); setEditId(null) }}
                    className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black py-4 rounded-2xl transition-all">
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-50">
                  <div className="h-6 w-3/4 bg-gray-100 animate-pulse rounded-lg mb-4" />
                  <div className="h-4 w-1/4 bg-gray-50 animate-pulse rounded-lg" />
                </div>
              ))
            ) : newsItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon size={32} className="text-gray-300" />
                </div>
                <p className="font-black text-gray-900 text-xl">Belum ada berita</p>
                <p className="text-gray-400 text-sm mt-2">Daftar berita yang Anda buat akan muncul di sini.</p>
              </div>
            ) : newsItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 border border-gray-50 transition-all duration-300">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      {item.category && (
                        <span className="text-[10px] bg-purple-50 text-purple-600 font-black px-3 py-1 rounded-full uppercase tracking-wider">
                          {item.category}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <h3 className="font-black text-xl text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2 leading-tight">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">{item.content}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                       <div className="flex items-center gap-2">
                         <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-[10px] font-black">
                           {item.author?.[0] || 'A'}
                         </div>
                         <span className="text-xs font-bold text-gray-600">{item.author || 'Admin'}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                           <ImageIcon size={12} /> {item.media?.filter((m: any) => m.type === 'image').length || 0}
                         </span>
                         <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                           <Video size={12} /> {item.media?.filter((m: any) => m.type === 'video').length || 0}
                         </span>
                       </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleEdit(item)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={18} />
                    </button>
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

