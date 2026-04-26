'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { formatDate, getSubscriptionPrice, formatCurrency } from '@/lib/utils'
import { ArrowLeft, CheckCircle, XCircle, Clock, Star, CreditCard, MapPin, Phone, MessageCircle, Flag, Trash2, Edit2, Save, Upload, Package, X } from 'lucide-react'
import { MediaUpload } from '@/components/admin/MediaUpload'
import Link from 'next/link'

export default function VendorDetailAdminPage() {
  const { id } = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    owner_name: '',
    phone: '',
    category_id: '',
    description: '',
    address_detail: '',
    hashtags: [] as string[],
    is_cod: false
  })
  const [hashtagInput, setHashtagInput] = useState('')
  const [ratingForm, setRatingForm] = useState({ quality_score: 4, cleanliness_score: 4, trust_score: 4, notes: '' })
  const [savingRating, setSavingRating] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('3_month')
  const [activatingSub, setActivatingSub] = useState(false)
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [productForm, setProductForm] = useState({ name: '', price: '', description: '', image_url: '' })
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [showAddService, setShowAddService] = useState(false)
  const [serviceForm, setServiceForm] = useState({ title: '', price: '', description: '' })
  const [editingService, setEditingService] = useState<any>(null)
  const [showAddJob, setShowAddJob] = useState(false)
  const [jobForm, setJobForm] = useState({ title: '', description: '', requirements: '', location: 'Dompu, NTB', type: 'Full-time' })
  const [editingJob, setEditingJob] = useState<any>(null)

  const getRemainingDays = (endDate?: string) => {
    if (!endDate) return 0
    return Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/vendors/${id}`, { cache: 'no-store' })
        const json = await res.json()
        const data = json.vendor
        setVendor(data)
        setEditForm({ 
          name: data?.name || '', 
          owner_name: data?.owner_name || '', 
          phone: data?.phone || '',
          category_id: data?.category_id || '',
          description: data?.description || '',
          address_detail: data?.address_detail || '',
          hashtags: data?.hashtags || [],
          is_cod: data?.is_cod || false
        })
        if (data?.ratings?.[0]) {
          setRatingForm({
            quality_score: data.ratings[0].quality_score,
            cleanliness_score: data.ratings[0].cleanliness_score,
            trust_score: data.ratings[0].trust_score,
            notes: data.ratings[0].notes || '',
          })
        }
      } catch (err) {
        console.error('Error fetching vendor:', err)
      }

      const { data: cats } = await supabase.from('categories').select('*')
      setAllCategories(cats || [])
      setLoading(false)
    }
    fetchData()
  }, [id])

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Gagal update status')

      // Refresh vendor data as approval now triggers subscription activation
      const vRes = await fetch(`/api/admin/vendors/${id}`, { cache: 'no-store' })
      const vJson = await vRes.json()
      setVendor(vJson.vendor)

      alert(`Status mitra berhasil diubah menjadi: ${status}`)
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`)
    }
  }

  const handleUpdateInfo = async () => {
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          owner_name: editForm.owner_name,
          phone: editForm.phone,
          category_id: editForm.category_id,
          description: editForm.description,
          address_detail: editForm.address_detail,
          hashtags: editForm.hashtags,
          is_cod: editForm.is_cod
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Gagal memperbarui informasi')
      }
 else {
        const { error } = await supabase.from('products').insert(data)
        if (error) throw error
      }

      const { data: newProds } = await supabase.from('products').select('*').eq('vendor_id', id)
      setVendor((prev: any) => ({ ...prev, products: newProds }))
      
      setShowAddProduct(false)
      setEditingProduct(null)
      setProductForm({ name: '', price: '', description: '', image_url: '' })
    } catch (err: any) {
      alert(`Gagal menyimpan produk: ${err.message}`)
    }
  }

  const handleSaveService = async () => {
    try {
      const data = {
        vendor_id: id,
        title: serviceForm.title,
        price: parseFloat(serviceForm.price.replace(/\D/g, '')) || 0,
        description: serviceForm.description,
      }

      if (editingService) {
        const { error } = await supabase.from('services').update(data).eq('id', editingService.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('services').insert(data)
        if (error) throw error
      }

      const { data: newSvcs } = await supabase.from('services').select('*').eq('vendor_id', id)
      setVendor((prev: any) => ({ ...prev, services: newSvcs }))
      
      setShowAddService(false)
      setEditingService(null)
      setServiceForm({ title: '', price: '', description: '' })
    } catch (err: any) {
      alert(`Gagal menyimpan layanan: ${err.message}`)
    }
  }

  const handleSaveJob = async () => {
    try {
      const data = {
        vendor_id: id,
        title: jobForm.title,
        description: jobForm.description,
        requirements: jobForm.requirements,
        location: jobForm.location,
        type: jobForm.type,
      }

      if (editingJob) {
        const { error } = await supabase.from('jobs').update(data).eq('id', editingJob.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('jobs').insert(data)
        if (error) throw error
      }

      const { data: newJobs } = await supabase.from('jobs').select('*').eq('vendor_id', id)
      setVendor((prev: any) => ({ ...prev, jobs: newJobs }))
      
      setShowAddJob(false)
      setEditingJob(null)
      setJobForm({ title: '', description: '', requirements: '', location: 'Dompu, NTB', type: 'Full-time' })
    } catch (err: any) {
      alert(`Gagal menyimpan lowongan: ${err.message}`)
    }
  }

  const handleDeleteVendor = async () => {
    if (!confirm('PERINGATAN: Apakah Anda yakin ingin menghapus mitra ini PERMANEN beserta semua data dan fotonya?')) return
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      alert('Mitra berhasil dihapus!')
      router.push('/admin/vendors')
    } catch (err: any) {
      alert(`Gagal menghapus mitra: ${err.message}`)
    }
  }

  const handleDeleteItem = async (table: string, itemId: string) => {
    if (!confirm('Hapus item ini?')) return
    try {
      const { error } = await supabase.from(table).delete().eq('id', itemId)
      if (error) throw error
      setVendor((prev: any) => ({
        ...prev,
        [table]: prev[table].filter((i: any) => i.id !== itemId)
      }))
    } catch (err: any) {
      alert(`Gagal menghapus item: ${err.message}`)
    }
  }

  const saveRating = async () => {
    setSavingRating(true)
    try {
      if (vendor.ratings?.[0]) {
        const { error } = await supabase.from('ratings').update(ratingForm).eq('id', vendor.ratings[0].id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('ratings').insert({ vendor_id: id, ...ratingForm })
        if (error) throw error
      }
      alert('Rating disimpan!')
    } catch (err: any) {
      alert(`Gagal menyimpan rating: ${err.message}`)
    } finally {
      setSavingRating(false)
    }
  }

  const activateSubscription = async () => {
    setActivatingSub(true)
    try {
      const res = await fetch(`/api/admin/vendors`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          activateSubscription: true,
          plan: selectedPlan 
        }),
      })
      if (!res.ok) throw new Error('Gagal aktifkan langganan')

      // Refresh vendor data to get new subscription dates
      const vRes = await fetch(`/api/admin/vendors/${id}`, { cache: 'no-store' })
      const vJson = await vRes.json()
      setVendor(vJson.vendor)

      alert(`Langganan ${selectedPlan} berhasil diaktifkan!`)
    } catch (err: any) {
      alert(`Gagal mengaktifkan langganan: ${err.message}`)
    } finally {
      setActivatingSub(false)
    }
  }

  if (loading) return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  )

  if (!vendor) return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6">
        <p className="text-gray-500">Vendor tidak ditemukan</p>
      </main>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin/vendors" className="p-2 bg-white rounded-xl border border-gray-100 text-gray-500 hover:text-purple-600">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{vendor.name}</h1>
              <p className="text-sm text-gray-500">{vendor.owner_name} · {vendor.categories?.name}</p>
            </div>
            <div className="ml-auto flex gap-2 items-center">
              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold badge-${vendor.status}`}>
                {vendor.status}
              </span>
              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold hidden sm:block ${
                vendor.subscription_status === 'active' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : vendor.subscription_status === 'expired'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}>
                {vendor.subscription_status}
              </span>
              <button onClick={() => setIsEditing(!isEditing)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                {isEditing ? <XCircle size={16} /> : <Edit2 size={16} />}
              </button>
              <button onClick={handleDeleteVendor} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">Informasi Dasar</h2>
              {isEditing ? (
                <div className="space-y-3 text-sm">
                  <div><label className="text-gray-500 block text-xs">Nama Usaha</label><input className="border w-full p-2 rounded-lg font-bold" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                  <div><label className="text-gray-500 block text-xs">Pemilik</label><input className="border w-full p-2 rounded-lg" value={editForm.owner_name} onChange={e => setEditForm({...editForm, owner_name: e.target.value})} /></div>
                  <div><label className="text-gray-500 block text-xs">WhatsApp</label><input className="border w-full p-2 rounded-lg" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
                  <div>
                    <label className="text-gray-500 block text-xs">Kategori</label>
                    <select className="border w-full p-2 rounded-lg" value={editForm.category_id} onChange={e => setEditForm({...editForm, category_id: e.target.value})}>
                      {allCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div><label className="text-gray-500 block text-xs">Deskripsi</label><textarea className="border w-full p-2 rounded-lg" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={3} /></div>
                  <div><label className="text-gray-500 block text-xs">Alamat Detail</label><textarea className="border w-full p-2 rounded-lg" value={editForm.address_detail} onChange={e => setEditForm({...editForm, address_detail: e.target.value})} rows={2} /></div>

                  <div>
                    <label className="text-gray-500 block text-xs mb-1">Hashtags</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {editForm.hashtags.map(tag => (
                        <span key={tag} className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-purple-100">
                          #{tag}
                          <button onClick={() => setEditForm({...editForm, hashtags: editForm.hashtags.filter(t => t !== tag)})}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="border flex-1 p-2 rounded-lg text-sm"
                        placeholder="Tambah tag..."
                        value={hashtagInput}
                        onChange={e => setHashtagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const tag = hashtagInput.trim().replace(/^#/, '')
                            if (tag && !editForm.hashtags.includes(tag)) {
                              setEditForm({...editForm, hashtags: [...editForm.hashtags, tag]})
                            }
                            setHashtagInput('')
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                    <input
                      type="checkbox"
                      id="edit-is-cod"
                      checked={editForm.is_cod}
                      onChange={e => setEditForm({...editForm, is_cod: e.target.checked})}
                    />
                    <label htmlFor="edit-is-cod" className="text-xs font-bold text-gray-700 cursor-pointer">Bisa COD</label>
                  </div>

                  <button onClick={handleUpdateInfo} className="btn-primary w-full py-2 rounded-xl text-white font-bold flex items-center justify-center gap-2 mt-2"><Save size={16}/>Simpan Perubahan</button>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                {[
                  { label: 'Nama Usaha', value: vendor.name },
                  { label: 'Pemilik', value: vendor.owner_name },
                  { label: 'WhatsApp', value: vendor.phone },
                  { label: 'Kategori', value: vendor.categories?.name },
                  { label: 'Daftar', value: formatDate(vendor.created_at) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
                {vendor.description && (
                  <div className="pt-2 border-t border-gray-50">
                    <p className="text-gray-500 mb-1">Deskripsi</p>
                      <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">{vendor.description}</p>
                    </div>
                  )}

                  {vendor.address_detail && (
                    <div className="pt-2 border-t border-gray-50">
                      <p className="text-gray-500 mb-1">Alamat Detail</p>
                      <p className="text-gray-700 text-xs leading-relaxed">{vendor.address_detail}</p>
                    </div>
                  )}

                  {vendor.hashtags && vendor.hashtags.length > 0 && (
                    <div className="pt-2 border-t border-gray-50">
                      <p className="text-gray-500 mb-1">Hashtags</p>
                      <div className="flex flex-wrap gap-1">
                        {vendor.hashtags.map((tag: string) => (
                          <span key={tag} className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {vendor.is_cod && (
                    <div className="pt-2 border-t border-gray-50">
                      <span className="text-[10px] font-black bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">COD AVAILABLE ✓</span>
                  </div>
                )}
              </div>
              )}
              {/* Contact Actions */}
              <div className="flex gap-2 mt-4">
                <a href={`https://wa.me/${vendor.phone.replace(/\D/g,'').replace(/^0/,'62')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 btn-whatsapp text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                  <MessageCircle size={14} /> WhatsApp
                </a>
                {vendor.maps_link && (
                  <a href={vendor.maps_link} target="_blank" rel="noopener noreferrer"
                    className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-50">
                    <MapPin size={14} /> Maps
                  </a>
                )}
              </div>
            </div>

            {/* Status Actions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Manajemen Status</h2>
              <div className="space-y-2">
                <button onClick={() => updateStatus('surveyed')}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-blue-100 rounded-xl text-blue-700 hover:bg-blue-50 transition-all text-sm font-semibold">
                  <Clock size={16} /> Tandai Sudah Survei
                </button>
                <button onClick={() => updateStatus('approved')}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-green-100 rounded-xl text-green-700 hover:bg-green-50 transition-all text-sm font-semibold">
                  <CheckCircle size={16} /> Setujui Mitra
                </button>
                <button onClick={() => updateStatus('rejected')}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-red-100 rounded-xl text-red-700 hover:bg-red-50 transition-all text-sm font-semibold">
                  <XCircle size={16} /> Tolak Mitra
                </button>
                <button onClick={() => updateStatus('rejected')}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-orange-100 rounded-xl text-orange-700 hover:bg-orange-50 transition-all text-sm font-semibold">
                  <Flag size={16} /> Flag Bermasalah
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star size={16} className="text-yellow-400 fill-yellow-400" /> Penilaian Admin
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Kualitas', key: 'quality_score' },
                  { label: 'Kebersihan', key: 'cleanliness_score' },
                  { label: 'Kepercayaan', key: 'trust_score' },
                ].map((r) => (
                  <div key={r.key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">{r.label}</span>
                      <span className="text-sm font-bold text-purple-600">
                        {ratingForm[r.key as keyof typeof ratingForm]}/5
                      </span>
                    </div>
                    <input
                      type="range" min={1} max={5} step={1}
                      value={ratingForm[r.key as keyof typeof ratingForm] as number}
                      onChange={(e) => setRatingForm(prev => ({ ...prev, [r.key]: parseInt(e.target.value) }))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                ))}
                <textarea
                  placeholder="Catatan survei (opsional)"
                  value={ratingForm.notes}
                  onChange={(e) => setRatingForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button onClick={saveRating} disabled={savingRating}
                  className="w-full btn-primary text-white text-sm font-bold py-2.5 rounded-xl">
                  {savingRating ? 'Menyimpan...' : 'Simpan Rating'}
                </button>
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-purple-600" /> Kelola Langganan
              </h2>
              {vendor.subscriptions?.[0] && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paket</span>
                    <span className="font-semibold">{vendor.subscriptions[0].plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-semibold badge-${vendor.subscriptions[0].status} px-2 py-0.5 rounded-full text-xs`}>
                      {vendor.subscriptions[0].status}
                    </span>
                  </div>
                  {vendor.subscriptions[0].start_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tanggal Mulai</span>
                      <span className="font-semibold">{formatDate(vendor.subscriptions[0].start_date)}</span>
                    </div>
                  )}
                  {vendor.subscriptions[0].end_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Berakhir (End Date)</span>
                      <span className="font-semibold text-red-500">{formatDate(vendor.subscriptions[0].end_date)}</span>
                    </div>
                  )}
                  {vendor.subscriptions[0].end_date && (
                    <div className="flex justify-between pt-1 border-t border-gray-200 mt-2">
                      <span className="text-gray-500 font-bold">Sisa Waktu Aktif</span>
                      <span className="font-black text-purple-600">
                        {Math.max(0, getRemainingDays(vendor.subscriptions[0].end_date))} hari
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-3">
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {[
                    { value: '1_month', label: '1 Bulan – Rp 9.900' },
                    { value: '3_month', label: '3 Bulan – Rp 30.000' },
                    { value: '6_month', label: '6 Bulan – Rp 179.000' },
                    { value: '1_year', label: '1 Tahun – Rp 499.000' },
                  ].map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button onClick={activateSubscription} disabled={activatingSub}
                  className="w-full btn-primary text-white text-sm font-bold py-2.5 rounded-xl">
                  {activatingSub ? 'Memproses...' : '✅ Aktifkan Langganan'}
                </button>
                <button
                  onClick={async () => {
                    await supabase.from('vendors').update({ subscription_status: 'expired' }).eq('id', id)
                    setVendor((prev: any) => ({ ...prev, subscription_status: 'expired' }))
                  }}
                  className="w-full border border-red-200 text-red-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                  ❌ Nonaktifkan
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            {/* Products / Services Details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Daftar Produk & Layanan</h2>
              
              {vendor.products && vendor.products.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Produk</h3>
                    <button onClick={() => { setEditingProduct(null); setProductForm({name:'', price:'', description:'', image_url:''}); setShowAddProduct(true) }} className="text-[10px] font-bold text-purple-600 hover:underline">
                      + Tambah Produk
                    </button>
                  </div>

                  {showAddProduct && (
                    <div className="bg-purple-50 p-4 rounded-xl mb-4 border border-purple-100 space-y-3">
                      <p className="text-xs font-black text-purple-900 uppercase">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</p>
                      <input placeholder="Nama Produk" className="w-full p-2 text-sm rounded-lg border" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                      <input placeholder="Harga" className="w-full p-2 text-sm rounded-lg border" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                      <textarea placeholder="Deskripsi" className="w-full p-2 text-sm rounded-lg border" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={2} />
                      <MediaUpload type="image" label="Upload Foto Produk" onUploadSuccess={(url) => setProductForm({...productForm, image_url: url})} />
                      {productForm.image_url && <p className="text-[10px] text-green-600 truncate">{productForm.image_url}</p>}
                      <div className="flex gap-2">
                        <button onClick={handleSaveProduct} className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-bold">Simpan</button>
                        <button onClick={() => setShowAddProduct(false)} className="flex-1 bg-white border py-2 rounded-lg text-xs font-bold">Batal</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {vendor.products.map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-white border" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                              <Package size={20} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="font-bold text-purple-600 whitespace-nowrap">{formatCurrency(p.price || 0)}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => { 
                              setEditingProduct(p); 
                              setProductForm({ name: p.name, price: p.price.toString(), description: p.description || '', image_url: p.image_url || '' });
                              setShowAddProduct(true);
                            }} className="text-blue-500 p-2 hover:bg-white rounded-lg transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteItem('products', p.id)} className="text-red-500 p-2 hover:bg-white rounded-lg transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vendor.services && vendor.services.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Layanan / Jasa</h3>
                    <button onClick={() => { setEditingService(null); setServiceForm({title:'', price:'', description:''}); setShowAddService(true) }} className="text-[10px] font-bold text-purple-600 hover:underline">
                      + Tambah Layanan
                    </button>
                  </div>

                  {showAddService && (
                    <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100 space-y-3">
                      <p className="text-xs font-black text-blue-900 uppercase">{editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}</p>
                      <input placeholder="Nama Layanan" className="w-full p-2 text-sm rounded-lg border" value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} />
                      <input placeholder="Harga (Opsional)" className="w-full p-2 text-sm rounded-lg border" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} />
                      <textarea placeholder="Deskripsi" className="w-full p-2 text-sm rounded-lg border" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} rows={2} />
                      <div className="flex gap-2">
                        <button onClick={handleSaveService} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold">Simpan</button>
                        <button onClick={() => setShowAddService(false)} className="flex-1 bg-white border py-2 rounded-lg text-xs font-bold">Batal</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {vendor.services.map((s: any) => (
                      <div key={s.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{s.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{s.description}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="font-bold text-purple-600 whitespace-nowrap">{formatCurrency(s.price || 0)}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => { 
                              setEditingService(s); 
                              setServiceForm({ title: s.title, price: s.price?.toString() || '', description: s.description || '' });
                              setShowAddService(true);
                            }} className="text-blue-500 p-2 hover:bg-white rounded-lg transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteItem('services', s.id)} className="text-red-500 p-2 hover:bg-white rounded-lg transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vendor.jobs && vendor.jobs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lowongan</h3>
                    <button onClick={() => { setEditingJob(null); setJobForm({title:'', description:'', requirements:'', location:'Dompu, NTB', type:'Full-time'}); setShowAddJob(true) }} className="text-[10px] font-bold text-purple-600 hover:underline">
                      + Tambah Loker
                    </button>
                  </div>

                  {showAddJob && (
                    <div className="bg-orange-50 p-4 rounded-xl mb-4 border border-orange-100 space-y-3">
                      <p className="text-xs font-black text-orange-900 uppercase">{editingJob ? 'Edit Lowongan' : 'Tambah Lowongan Baru'}</p>
                      <input placeholder="Judul Lowongan" className="w-full p-2 text-sm rounded-lg border" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                      <textarea placeholder="Deskripsi" className="w-full p-2 text-sm rounded-lg border" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} rows={2} />
                      <textarea placeholder="Syarat" className="w-full p-2 text-sm rounded-lg border" value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} rows={2} />
                      <div className="flex gap-2">
                        <button onClick={handleSaveJob} className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-xs font-bold">Simpan</button>
                        <button onClick={() => setShowAddJob(false)} className="flex-1 bg-white border py-2 rounded-lg text-xs font-bold">Batal</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {vendor.jobs.map((j: any) => (
                      <div key={j.id} className="text-sm p-3 bg-gray-50 rounded-xl flex items-start justify-between hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{j.title}</p>
                          <p className="text-xs text-gray-500">{j.description}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{j.requirements}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <button onClick={() => { 
                            setEditingJob(j); 
                            setJobForm({ title: j.title, description: j.description || '', requirements: j.requirements || '', location: j.location || 'Dompu, NTB', type: j.type || 'Full-time' });
                            setShowAddJob(true);
                          }} className="text-blue-500 p-2 hover:bg-white rounded-lg transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteItem('jobs', j.id)} className="text-red-500 p-2 hover:bg-white rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!vendor.products?.length && !vendor.services?.length && !vendor.jobs?.length) && (
                <p className="text-sm text-gray-500 text-center py-6">Tidak ada data produk/layanan</p>
              )}
            </div>

            {/* Media Details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Galeri & Media</h2>
                <div className="w-48">
                  <MediaUpload 
                    type="image" 
                    label="Tambah Foto"
                    onUploadSuccess={async (url) => {
                      await supabase.from('media').insert({ vendor_id: id, type: 'image', url })
                      setVendor((prev: any) => ({ ...prev, media: [...(prev.media || []), { id: Date.now().toString(), type: 'image', url }] }))
                    }} 
                  />
                </div>
              </div>
              {vendor.media && vendor.media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {vendor.media.map((m: any) => (
                    <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                      {m.type === 'image' || m.type === 'thumb' ? (
                        <img src={m.url} alt="Vendor Media" className="w-full h-full object-cover" />
                      ) : (
                        <video src={m.url} className="w-full h-full object-cover" controls muted />
                      )}
                      {isEditing && (
                        <button onClick={() => handleDeleteItem('media', m.id)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">Belum ada foto/video</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
