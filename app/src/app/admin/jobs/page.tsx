'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { Plus, Trash2, X, RefreshCw, Briefcase, MapPin, DollarSign, Image as ImageIcon, Video, Building2, Pencil } from 'lucide-react'
import { MediaUpload } from '@/components/admin/MediaUpload'
import Image from 'next/image'

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [cleaningUp, setCleaningUp] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    description: '',
    requirements: '',
    contact_info: '',
    salary_min: '',
    salary_max: '',
    location: 'Dompu, NTB',
    type: 'Full-time',
    expiry_date: '',
    media: [] as { type: 'image' | 'video', url: string }[]
  })
  const [newMedia, setNewMedia] = useState({ type: 'image' as 'image' | 'video', url: '' })

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/jobs', { cache: 'no-store' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal mengambil data loker')
      }
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (error: any) {
      console.error('Error fetching jobs:', error)
      setJobs([])
    }
    setLoading(false)
  }

  useEffect(() => { 
    fetchJobs() 
  }, [])

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.company_name.trim()) {
      alert('Judul dan Nama Perusahaan harus diisi!')
      return
    }
    
    setSaving(true)
    // Simpan nilai editId sebelum di-reset agar alert benar
    const isEditing = !!editId
    try {
      const jobPayload = {
        title: formData.title,
        company_name: formData.company_name,
        description: formData.description,
        requirements: formData.requirements,
        contact_info: formData.contact_info,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        location: formData.location,
        type: formData.type,
        expiry_date: formData.expiry_date || null,
        media: formData.media,
      }

      let res: Response
      if (isEditing) {
        res = await fetch('/api/admin/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...jobPayload }),
        })
      } else {
        res = await fetch('/api/admin/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobPayload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menyimpan loker')
      }

      // Reset form
      setFormData({
        title: '', company_name: '', description: '', requirements: '',
        contact_info: '', salary_min: '', salary_max: '',
        location: 'Dompu, NTB', type: 'Full-time', expiry_date: '', media: []
      })
      setShowForm(false)
      setEditId(null)
      setSaving(false)
      
      // Refresh data
      await fetchJobs()
      alert(isEditing ? 'Loker berhasil diperbarui!' : 'Loker berhasil ditambahkan!')
    } catch (error: any) {
      console.error('Error saving job:', error)
      alert(`Gagal menyimpan loker: ${error?.message || 'Silakan coba lagi.'}`)
      setSaving(false)
    }
  }

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      company_name: item.company_name || '',
      description: item.description || '',
      requirements: item.requirements || '',
      contact_info: item.contact_info || '',
      salary_min: item.salary_min?.toString() || '',
      salary_max: item.salary_max?.toString() || '',
      location: item.location || 'Dompu, NTB',
      type: item.type || 'Full-time',
      expiry_date: item.expiry_date || '',
      media: item.media || []
    })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus lowongan ini?')) return

    // Optimistic update: hapus dari state dulu agar UI langsung responsif
    setJobs(prev => prev.filter(j => j.id !== id))

    try {
      const res = await fetch(`/api/admin/jobs?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus loker')
      }
      // Refresh data dari server untuk konfirmasi
      await fetchJobs()
      alert('Loker berhasil dihapus!')
    } catch (error: any) {
      console.error('Error deleting job:', error)
      // Kembalikan data jika gagal
      await fetchJobs()
      alert(`Gagal menghapus loker: ${error?.message || 'Silakan coba lagi.'}`)
    }
  }

  const handleCleanupExpired = async () => {
    setCleaningUp(true)
    try {
      const response = await fetch('/api/admin/jobs/cleanup', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        alert(`✅ Berhasil menghapus ${data.deletedCount} loker yang sudah expired`)
        await fetchJobs()
      } else {
        alert('❌ Gagal membersihkan loker expired')
      }
    } catch (error) {
      console.error('Cleanup error:', error)
      alert('Terjadi kesalahan saat membersihkan loker expired.')
    } finally {
      setCleaningUp(false)
    }
  }

  const addMediaRow = () => {
    if (!newMedia.url.trim()) {
      alert('Masukkan URL media terlebih dahulu')
      return
    }
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
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Loker</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">Temukan bakat terbaik untuk setiap posisi.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchJobs} className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-purple-600 transition-all hover:shadow-sm" title="Refresh">
                <RefreshCw size={20} />
              </button>
              <button
                onClick={handleCleanupExpired}
                disabled={cleaningUp}
                className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-orange-600 transition-all hover:shadow-sm disabled:opacity-50"
                title="Hapus loker yang sudah expired"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={() => { setShowForm(true); setEditId(null); setFormData({ title: '', company_name: '', description: '', requirements: '', contact_info: '', salary_min: '', salary_max: '', location: 'Dompu, NTB', type: 'Full-time', expiry_date: '', media: [] }) }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
              >
                <Plus size={18} /> Tambah Loker
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/50 border border-gray-50 mb-10 animate-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Briefcase size={24} className="text-purple-600" />
                    {editId ? 'Edit Lowongan' : 'Tambah Lowongan Baru'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Lengkapi informasi pekerjaan secara detail.</p>
                </div>
                <button onClick={() => { setShowForm(false); setEditId(null) }} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Posisi / Jabatan *</label>
                    <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: Admin Gudang" className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Nama Perusahaan *</label>
                    <input value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Masukkan nama perusahaan" className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Lokasi Kerja</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Tipe Pekerjaan</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full text-sm font-bold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none transition-all">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Kontrak</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Kontak info (WA / Email)</label>
                    <input value={formData.contact_info} onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      placeholder="Contoh: 0812XXX atau email@usaha.com" className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Gaji (Opsional)</label>
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                         <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                         <input placeholder="Min" type="number" value={formData.salary_min} onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                           className="w-full text-sm font-bold bg-gray-50 border border-gray-100 rounded-2xl pl-10 pr-4 py-4" />
                       </div>
                       <div className="relative flex-1">
                         <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                         <input placeholder="Max" type="number" value={formData.salary_max} onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                           className="w-full text-sm font-bold bg-gray-50 border border-gray-100 rounded-2xl pl-10 pr-4 py-4" />
                       </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Tanggal Berakhir (Opsional)</label>
                  <input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                  <p className="text-[10px] text-gray-400 mt-2">Loker akan otomatis terhapus setelah tanggal ini.</p>
                </div>

                <div>
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Media (Banner/Poster Loker)</label>
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
                   
                    <div className="flex gap-3">
                      <select value={newMedia.type} onChange={(e) => setNewMedia({...newMedia, type: e.target.value as 'image' | 'video'})}
                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none">
                        <option value="image">Gambar</option>
                        <option value="video">Video</option>
                      </select>
                      <div className="flex-1">
                        <MediaUpload 
                          type={newMedia.type}
                          onUploadSuccess={(url) => {
                            setFormData({ ...formData, media: [...formData.media, { type: newMedia.type, url }] })
                          }}
                        />
                      </div>
                      <div className="flex-[2] relative">
                        <input value={newMedia.url} onChange={(e) => setNewMedia({...newMedia, url: e.target.value})}
                          placeholder="Atau masukkan URL..." className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all" />
                        <button onClick={addMediaRow} className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 transition-all">
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                 </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Deskripsi Pekerjaan</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Jelaskan detail pekerjaan, tanggung jawab, dan hal-hal penting..." rows={3}
                    className="w-full text-sm font-medium bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none" />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Syarat &amp; Kualifikasi</label>
                  <textarea value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Contoh: Pria/Wanita, Min SMA, Jujur dan teliti..." rows={3}
                    className="w-full text-sm font-medium bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none" />
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={handleSave} disabled={saving || !formData.title || !formData.company_name}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-100 transition-all disabled:bg-gray-200">
                    {saving ? 'Sedang Menyimpan...' : editId ? 'Perbarui Loker' : 'Publikasikan Loker'}
                  </button>
                  <button onClick={() => { setShowForm(false); setEditId(null) }}
                    className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black py-4 rounded-2xl transition-all">
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
               Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white h-24 rounded-2xl animate-pulse" />
              ))
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase size={32} className="text-gray-300" />
                </div>
                <p className="font-black text-gray-900 text-xl">Belum ada lowongan</p>
                <p className="text-gray-400 text-sm mt-2">Daftar loker yang Anda buat akan muncul di sini.</p>
              </div>
            ) : (
              jobs.map((job) => {
                const firstImage = job.media?.find((m: any) => m.type === 'image')
                return (
                <div key={job.id} className="group bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 border border-gray-50 transition-all duration-300">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0 overflow-hidden">
                       {firstImage ? (
                         <Image src={firstImage.url} alt={job.title} width={64} height={64} className="w-full h-full object-cover" />
                       ) : (
                         <Building2 size={30} />
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className="font-black text-lg text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors uppercase tracking-tight">{job.title}</h3>
                       <p className="text-purple-600 font-bold text-sm">{job.company_name || 'Perusahaan'}</p>
                       <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase">
                            <MapPin size={12} /> {job.location || 'Dompu'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase">
                            <ImageIcon size={12} /> {job.media?.length || 0} Media
                          </span>
                          {job.expiry_date && (
                            <span className="text-[10px] text-orange-400 font-bold uppercase">
                              Exp: {job.expiry_date}
                            </span>
                          )}
                       </div>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={() => handleEdit(job)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                         <Pencil size={16} />
                       </button>
                       <button onClick={() => handleDelete(job.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                         <Trash2 size={16} />
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
