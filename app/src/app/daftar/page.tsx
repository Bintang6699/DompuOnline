'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { VendorFormData, SubscriptionPlan } from '@/lib/types'
import { getSubscriptionPrice, getSubscriptionLabel, formatCurrency } from '@/lib/utils'
import {
  CheckCircle, Upload, ArrowRight, ArrowLeft, MapPin,
  Phone, Store, Package, Crown, Sparkles, X, Plus, ShieldAlert, BookOpen, MessageCircle
} from 'lucide-react'

const CATEGORIES = [
  { value: 'transport', label: '🏍️ Transport (Ojek/Mobil)' },
  { value: 'food', label: '🍽️ Kuliner (Makanan & Minuman)' },
  { value: 'shopping', label: '🛍️ Belanja (Produk/Elektronik)' },
  { value: 'services', label: '🔧 Jasa (Layanan Profesional)' },
]

const SUBSCRIPTION_PLANS = [
  { plan: '1_month' as SubscriptionPlan, popular: false, badge: '' },
  { plan: '3_month' as SubscriptionPlan, popular: true, badge: 'Terpopuler' },
  { plan: '6_month' as SubscriptionPlan, popular: false, badge: 'Hemat 25%' },
  { plan: '1_year' as SubscriptionPlan, popular: false, badge: 'Hemat 35%' },
]

const VEHICLE_TYPES = [
  { value: 'motor', label: 'Motor / Ojek' },
  { value: 'mobil', label: 'Mobil / Sewa' },
  { value: 'pickup', label: 'Pickup / Angkut Barang' },
]

const steps = [
  { id: 1, label: 'Info Usaha', icon: Store },
  { id: 2, label: 'Detail', icon: Package },
  { id: 3, label: 'Media & Lokasi', icon: MapPin },
  { id: 4, label: 'Paket', icon: Crown },
]

const formatInputCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('id-ID').format(parseInt(digits))
}

import { getSettings } from '@/app/actions/settings'

export default function DaftarPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [gallery, setGallery] = useState<File[]>([])
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [videoPreview, setVideoPreview] = useState<string>('')
  const [galleryPreview, setGalleryPreview] = useState<string[]>([])
  const [menus, setMenus] = useState([{ name: '', price: '', description: '', image: null as File | null, imagePreview: '' }])
  const [productsList, setProductsList] = useState([{ name: '', price: '', description: '', image: null as File | null, imagePreview: '' }])
  const [servicesList, setServicesList] = useState([{ title: '', price: '', description: '', image: null as File | null, imagePreview: '' }])
  const [enableFreeTrial, setEnableFreeTrial] = useState(false)

  useEffect(() => {
    getSettings().then(res => setEnableFreeTrial(!!res.enableFreeTrial)).catch(console.error)
  }, [])

  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    owner_name: '',
    phone: '',
    category_id: '',
    description: '',
    maps_link: '',
    latitude: '',
    longitude: '',
    vehicle_type: '',
    service_area: '',
    job_title: '',
    job_description: '',
    job_requirements: '',
    plan: '1_month',
  })

  const updateField = (field: keyof VendorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnail(file)
      const reader = new FileReader()
      reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideo(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }
  const handleItemImage = (type: 'menu' | 'product' | 'service', index: number, file: File | undefined) => {
    if (!file) return
    const preview = URL.createObjectURL(file)
    if (type === 'menu') {
      const updated = [...menus]
      updated[index].image = file
      updated[index].imagePreview = preview
      setMenus(updated)
    } else if (type === 'product') {
      const updated = [...productsList]
      updated[index].image = file
      updated[index].imagePreview = preview
      setProductsList(updated)
    } else if (type === 'service') {
      const updated = [...servicesList]
      updated[index].image = file
      updated[index].imagePreview = preview
      setServicesList(updated)
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setGallery((prev) => [...prev, ...files].slice(0, 4))
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setGalleryPreview((prev) => [...prev, ev.target?.result as string].slice(0, 4))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index))
    setGalleryPreview((prev) => prev.filter((_, i) => i !== index))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Nama usaha wajib diisi'
      if (!formData.owner_name.trim()) newErrors.owner_name = 'Nama pemilik wajib diisi'
      if (!formData.phone.trim()) newErrors.phone = 'Nomor WhatsApp wajib diisi'
      if (!formData.category_id) newErrors.category_id = 'Pilih kategori usaha'
      if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi'
    }
    if (step === 3) {
      if (!thumbnail) newErrors.thumbnail = 'Thumbnail wajib di-upload'
    }
    if (step === 4) {
      if (!formData.plan) newErrors.plan = 'Pilih paket berlangganan'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, 4))
    }
  }

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    if (!validateStep(4)) return
    setLoading(true)

    try {
      // Get category ID from slug
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', formData.category_id)
        .single()

      const categoryId = catData?.id || null

      const vendorId = crypto.randomUUID()

      let finalDescription = formData.description
      if (formData.category_id === 'transport') {
        const vType = formData.vehicle_type === 'mobil' ? '🚗 Mobil' : '🏍️ Motor'
        const vMerk = formData.transport_merk || '-'
        const vPlate = formData.transport_plate || '-'
        const vYear = formData.transport_year ? `(${formData.transport_year})` : ''
        const vArea = formData.service_area || '-'
        
        finalDescription = `📍 Area Operasi: ${vArea}\n${vType}: ${vMerk} ${vYear}\n🏁 Plat Nomor: ${vPlate}\n\n${formData.description}`
      }

      // Insert vendor without .select() because RLS blocks fetching pending vendors
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          id: vendorId,
          name: formData.name,
          owner_name: formData.owner_name,
          phone: formData.phone,
          category_id: categoryId,
          description: finalDescription,
          maps_link: formData.maps_link || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          status: 'pending',
          subscription_status: 'pending',
        })

      if (vendorError) throw vendorError

      // Helper func to upload media
      const uploadMedia = async (file: File, type: string, indexType: string) => {
        const ext = file.name.split('.').pop()
        const path = `vendors/${vendorId}/${indexType}_${Date.now()}.${ext}`
        const { data: uploaded } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600' })
        if (uploaded) {
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
          if (type === 'media_table') {
            await supabase.from('media').insert({ vendor_id: vendorId, type: indexType.startsWith('vid') ? 'video' : 'image', url: urlData.publicUrl })
          }
          return urlData.publicUrl
        }
        return null
      }

      if (thumbnail) await uploadMedia(thumbnail, 'media_table', 'thumb')
      if (video) await uploadMedia(video, 'media_table', 'video')
      for (let i = 0; i < gallery.length; i++) {
        await uploadMedia(gallery[i], 'media_table', `gal_${i}`)
      }

      // Insert category-specific data
      if (formData.category_id === 'food' && menus.some((m) => m.name)) {
        const validMenus = menus.filter((m) => m.name.trim())
        const menuRecords = []
        for (const m of validMenus) {
          let imageUrl = null
          if (m.image) {
            imageUrl = await uploadMedia(m.image, 'product_image', `menu_${Date.now()}_${Math.random().toString(36).substring(7)}`)
          }
          menuRecords.push({
            vendor_id: vendorId,
            name: m.name,
            price: parseFloat(m.price.replace(/\D/g, '')) || 0,
            description: m.description || null,
            image_url: imageUrl
          })
        }
        await supabase.from('products').insert(menuRecords)
      }

      if (formData.category_id === 'shopping' && productsList.some((p) => p.name)) {
        const validProducts = productsList.filter((p) => p.name.trim())
        const productRecords = []
        for (const p of validProducts) {
          let imageUrl = null
          if (p.image) {
            imageUrl = await uploadMedia(p.image, 'product_image', `prod_${Date.now()}_${Math.random().toString(36).substring(7)}`)
          }
          productRecords.push({
            vendor_id: vendorId,
            name: p.name,
            price: parseFloat(p.price.replace(/\D/g, '')) || 0,
            description: p.description || null,
            image_url: imageUrl
          })
        }
        await supabase.from('products').insert(productRecords)
      }

      if (formData.category_id === 'services' && servicesList.some((s) => s.title)) {
        const validServices = servicesList.filter((s) => s.title.trim())
        await supabase.from('services').insert(
          validServices.map((s) => ({
            vendor_id: vendorId,
            title: s.title,
            price: parseFloat(s.price.replace(/\D/g, '')) || null,
            description: s.description || null,
          }))
        )
      }

      if (formData.category_id === 'transport' && formData.transport_base_price) {
        await supabase.from('services').insert({
          vendor_id: vendorId,
          title: `Tarif Dasar Mulai Dari`,
          price: parseFloat(formData.transport_base_price.replace(/\D/g, '')) || 0,
          description: 'Harga detail akan disepakati langsung via WhatsApp (Tergantung Jarak / Tujuan).'
        })
      }



      // Insert subscription record
      await supabase.from('subscriptions').insert({
        vendor_id: vendorId,
        plan: formData.plan || '1_month',
        status: 'pending',
        amount_paid: getSubscriptionPrice(formData.plan || '1_month'),
      })

      setSuccess(true)
    } catch (err: any) {
      console.error('Registration Error:', err)
      const errorMessage = err?.message || 'Terjadi kesalahan. Coba lagi.'
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Pendaftaran Berhasil! 🎉</h1>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Terima kasih telah mendaftar sebagai mitra DompuOnline! Tim kami akan meninjau pendaftaranmu
            dalam 1–2 hari kerja dan menghubungi via WhatsApp.
          </p>
          <div className="bg-purple-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-purple-800 mb-2">Langkah selanjutnya:</p>
            <div className="space-y-2">
              {['Admin akan meninjau data usahamu', 'Tim survei akan mengunjungi lokasi', 'Setelah disetujui, usahamu akan tampil di DompuOnline'].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-600">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="btn-primary w-full text-white font-bold py-3 rounded-xl"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="max-w-lg mx-auto px-4 pt-5 pb-28">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Daftar Sebagai Mitra</h1>
          <p className="text-sm text-gray-500">Lengkapi data usahamu untuk tampil di DompuOnline</p>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-purple-100">
          <div className="flex gap-3 mb-4">
            <Link href="/panduan" className="flex-1">
              <div className="bg-purple-50 hover:bg-purple-100 transition-colors rounded-2xl p-4 text-center h-full border border-purple-100/50">
                <BookOpen className="text-purple-600 mx-auto mb-1.5" size={24} />
                <span className="text-[10px] font-black text-purple-900 block uppercase tracking-tight">Panduan Pendaftaran</span>
              </div>
            </Link>
            <Link href="/contact" className="flex-1">
              <div className="bg-blue-50 hover:bg-blue-100 transition-colors rounded-2xl p-4 text-center h-full border border-blue-100/50">
                <MessageCircle className="text-blue-600 mx-auto mb-1.5" size={24} />
                <span className="text-[10px] font-black text-blue-900 block uppercase tracking-tight">Chat Admin</span>
              </div>
            </Link>
          </div>
          <div className="space-y-3 border-t border-purple-50 pt-4">
            <div className="flex gap-3 text-xs text-gray-500 leading-relaxed">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <BookOpen size={14} className="text-purple-400" />
              </div>
              <p><span className="text-purple-700 font-bold">Panduan:</span> Pelajari langkah-langkah, syarat pendaftaran, serta aturan ketat platform agar tokomu lancar dikelola.</p>
            </div>
            <div className="flex gap-3 text-xs text-gray-500 leading-relaxed">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <MessageCircle size={14} className="text-blue-400" />
              </div>
              <p><span className="text-blue-700 font-bold">Kontak Admin:</span> Gunakan ini jika butuh bantuan teknis saat upload berkas atau ingin konfirmasi pembayaran langganan.</p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex flex-col items-center gap-1 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'gradient-primary text-white shadow-md shadow-purple-200'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={16} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-[10px] font-semibold hidden sm:block ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Store size={18} className="text-purple-600" /> Informasi Usaha
            </h2>
            <Input
              id="name"
              label="Nama Usaha"
              placeholder="Contoh: Warung Bu Siti, Ojek Online Rudi"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={errors.name}
              required
            />
            <Input
              id="owner_name"
              label="Nama Pemilik"
              placeholder="Nama lengkap pemilik usaha"
              value={formData.owner_name}
              onChange={(e) => updateField('owner_name', e.target.value)}
              error={errors.owner_name}
              required
            />
            <Input
              id="phone"
              label="Nomor WhatsApp"
              placeholder="08xxxxxxxxxx"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              error={errors.phone}
              hint="Pelanggan akan menghubungi nomor ini langsung"
              required
            />
            <Select
              id="category_id"
              label="Kategori Usaha"
              options={CATEGORIES}
              value={formData.category_id}
              onChange={(e) => updateField('category_id', e.target.value)}
              error={errors.category_id}
              required
            />
            <Textarea
              id="description"
              label="Deskripsi Usaha"
              placeholder="Ceritakan tentang usahamu, produk/layanan yang ditawarkan..."
              rows={4}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              error={errors.description}
              required
            />
          </div>
        )}

        {/* Step 2: Category-Specific */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Package size={18} className="text-purple-600" /> Detail Usaha
            </h2>

            {/* Transport */}
            {formData.category_id === 'transport' && (
              <>
                <Select
                  id="vehicle_type"
                  label="Jenis Kendaraan"
                  options={VEHICLE_TYPES}
                  value={formData.vehicle_type || ''}
                  onChange={(e) => updateField('vehicle_type', e.target.value)}
                />
                <Input
                  id="transport_merk"
                  label="Tipe / Merk Kendaraan"
                  placeholder={formData.vehicle_type === 'mobil' ? 'Contoh: Avanza, Xenia, Brio' : 'Contoh: Beat, Vario, NMAX'}
                  value={formData.transport_merk || ''}
                  onChange={(e) => updateField('transport_merk', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id="transport_plate"
                    label="Plat Nomor"
                    placeholder="E.g. EA 1234 XY"
                    value={formData.transport_plate || ''}
                    onChange={(e) => updateField('transport_plate', e.target.value)}
                  />
                  <Input
                    id="transport_year"
                    label="Tahun (Opsi)"
                    placeholder="E.g. 2018"
                    value={formData.transport_year || ''}
                    onChange={(e) => updateField('transport_year', e.target.value)}
                  />
                </div>
                <Input
                  id="service_area"
                  label="Kecamatan / Wilayah Operasi"
                  placeholder="Contoh: Dompu Kota, Woja, Kempo"
                  value={formData.service_area || ''}
                  onChange={(e) => updateField('service_area', e.target.value)}
                />

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mt-4">
                  <h3 className="text-sm font-bold text-purple-900 mb-2">Tarif Dasar / Rekomendasi 💰</h3>
                  <p className="text-xs text-purple-700 mb-3 leading-relaxed">
                    Kami sarankan menampilkan tarif referensi per-KM ({formData.vehicle_type === 'mobil' ? 'Rp. 4.000 - Rp. 6.000/km' : 'Rp. 2.000 - Rp. 3.000/km'}) 
                    atau Acuan Harga agar pelanggan tertari. Detail harga selalu di nego via WA!
                  </p>
                  <Input
                    id="transport_base_price"
                    label={`Pilih / Ketik Tarif Mulai Dari (Per KM atau Acuan Minimal)`}
                    placeholder={`Mulai dari Rp. ${formData.vehicle_type === 'mobil' ? '10.000' : '5.000'}`}
                    value={formData.transport_base_price || ''}
                    onChange={(e) => updateField('transport_base_price', formatInputCurrency(e.target.value))}
                    type="text"
                    inputMode="numeric"
                  />
                </div>
              </>
            )}

            {/* Food */}
            {formData.category_id === 'food' && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Menu & Harga <span className="text-red-500">*</span>
                </label>
                {menus.map((menu, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3 relative">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 shrink-0 relative rounded-xl overflow-hidden bg-white border-2 border-dashed border-gray-200 flex items-center justify-center group">
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors">
                          {menu.imagePreview ? (
                            <>
                              <Image src={menu.imagePreview} alt="" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">UBAH</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Plus size={20} className="text-gray-300" />
                              <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Foto</span>
                            </>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleItemImage('menu', i, e.target.files?.[0])} />
                        </label>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <Input
                          id={`menu-name-${i}`}
                          placeholder="Nama menu"
                          value={menu.name}
                          onChange={(e) => {
                            const updated = [...menus]
                            updated[i].name = e.target.value
                            setMenus(updated)
                          }}
                        />
                        <Input
                          id={`menu-price-${i}`}
                          placeholder="Contoh: 15.000"
                          type="text"
                          inputMode="numeric"
                          value={menu.price}
                          onChange={(e) => {
                            const updated = [...menus]
                            updated[i].price = formatInputCurrency(e.target.value)
                            setMenus(updated)
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Input
                        id={`menu-desc-${i}`}
                        placeholder="Deskripsi singkat menu (opsional)"
                        value={menu.description}
                        onChange={(e) => {
                          const updated = [...menus]
                          updated[i].description = e.target.value
                          setMenus(updated)
                        }}
                      />
                    </div>
                    {menus.length > 1 && (
                      <button
                        onClick={() => setMenus(menus.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setMenus([...menus, { name: '', price: '', description: '', image: null, imagePreview: '' }])}
                  className="flex items-center gap-2 text-sm text-purple-600 font-semibold hover:text-purple-800 transition-colors"
                >
                  <Plus size={16} /> Tambah Item Menu
                </button>
              </div>
            )}

            {/* Shopping */}
            {formData.category_id === 'shopping' && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Daftar Produk</label>
                {productsList.map((p, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3 relative">
                    <div className="flex gap-4">
                       <div className="w-20 h-20 shrink-0 relative rounded-xl overflow-hidden bg-white border-2 border-dashed border-gray-200 flex items-center justify-center group">
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors">
                          {p.imagePreview ? (
                            <Image src={p.imagePreview} alt="" fill className="object-cover" />
                          ) : (
                            <>
                              <Plus size={20} className="text-gray-300" />
                              <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Foto</span>
                            </>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleItemImage('product', i, e.target.files?.[0])} />
                        </label>
                      </div>
                      <div className="flex-1 space-y-3">
                        <Input id={`prod-name-${i}`} placeholder="Nama produk" value={p.name}
                          onChange={(e) => { const u=[...productsList]; u[i].name=e.target.value; setProductsList(u) }} />
                        <Input id={`prod-price-${i}`} placeholder="Contoh: 50.000" type="text" inputMode="numeric" value={p.price}
                          onChange={(e) => { const u=[...productsList]; u[i].price=formatInputCurrency(e.target.value); setProductsList(u) }} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Input id={`prod-desc-${i}`} placeholder="Deskripsi produk (opsional)" value={p.description}
                        onChange={(e) => { const u=[...productsList]; u[i].description=e.target.value; setProductsList(u) }} />
                    </div>
                    {productsList.length > 1 && (
                      <button onClick={() => setProductsList(productsList.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600"><X size={14} /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setProductsList([...productsList, { name: '', price: '', description: '', image: null, imagePreview: '' }])}
                  className="flex items-center gap-2 text-sm text-purple-600 font-semibold">
                  <Plus size={16} /> Tambah Produk Baru
                </button>
              </div>
            )}

             {/* Services */}
            {formData.category_id === 'services' && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Daftar Layanan</label>
                {servicesList.map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3 relative">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 shrink-0 relative rounded-xl overflow-hidden bg-white border-2 border-dashed border-gray-200 flex items-center justify-center group">
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors">
                          {s.imagePreview ? (
                            <>
                              <Image src={s.imagePreview} alt="" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">UBAH</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Plus size={20} className="text-gray-300" />
                              <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Foto</span>
                            </>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleItemImage('service', i, e.target.files?.[0])} />
                        </label>
                      </div>
                      <div className="flex-1 space-y-3">
                        <Input id={`svc-title-${i}`} placeholder="Nama layanan" value={s.title}
                          onChange={(e) => { const u=[...servicesList]; u[i].title=e.target.value; setServicesList(u) }} />
                        <Input id={`svc-price-${i}`} placeholder="Contoh: 100.000 (opsional)" type="text" inputMode="numeric" value={s.price}
                          onChange={(e) => { const u=[...servicesList]; u[i].price=formatInputCurrency(e.target.value); setServicesList(u) }} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Input id={`svc-desc-${i}`} placeholder="Deskripsi layanan" value={s.description}
                        onChange={(e) => { const u=[...servicesList]; u[i].description=e.target.value; setServicesList(u) }} />
                    </div>
                    {servicesList.length > 1 && (
                      <button onClick={() => setServicesList(servicesList.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600"><X size={14} /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setServicesList([...servicesList, { title: '', price: '', description: '', image: null, imagePreview: '' }])}
                  className="flex items-center gap-2 text-sm text-purple-600 font-semibold">
                  <Plus size={16} /> Tambah Layanan
                </button>
              </div>
            )}



            {!formData.category_id && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Kembali ke langkah sebelumnya untuk memilih kategori</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Media & Location */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <MapPin size={18} className="text-purple-600" /> Foto & Lokasi
            </h2>

            {/* Thumbnail Upload */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Desain Thumbnail <span className="text-red-500">*</span>
              </label>
              <div className="aspect-[16/9] relative rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
                {thumbnailPreview ? (
                  <>
                    <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                    <button onClick={() => { setThumbnail(null); setThumbnailPreview('') }} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white"><X size={14} /></button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-semibold">Upload Thumbnail Utama</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                  </label>
                )}
              </div>
              {errors.thumbnail && <p className="text-xs text-red-500 mt-1">{errors.thumbnail}</p>}
            </div>

            {/* Video Upload */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Video Profil (Opsional)</label>
              <div className="aspect-[16/9] relative rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
                {videoPreview ? (
                  <>
                    <video src={videoPreview} className="w-full h-full object-cover" controls />
                    <button onClick={() => { setVideo(null); setVideoPreview('') }} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white z-10"><X size={14} /></button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-semibold">Upload Video</span>
                    <span className="text-xs text-gray-400">MP4, WebM (Maks 10MB)</span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery Upload */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Galeri Tambahan (Maks 4 Image Opsional)
              </label>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                {formData.category_id === 'transport' 
                  ? 'Gunakan galeri ini untuk mengupload Foto Kendaraan, identitas, atau foto STNK agar penumpang merasa aman & percaya.'
                  : 'Bisa upload foto menu tambahan, suasana usaha, atau produk lainnya.'}
              </p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {galleryPreview.map((src, i) => (
                  <div key={i} className="aspect-square relative rounded-xl overflow-hidden bg-gray-100">
                    <Image src={src} alt="" fill className="object-cover" />
                    <button onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {galleryPreview.length < 4 && (
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                    <Upload size={18} className="text-gray-400" />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Location */}
            <Input
              id="maps_link"
              label="Link Google Maps"
              placeholder="https://maps.google.com/..."
              value={formData.maps_link}
              onChange={(e) => updateField('maps_link', e.target.value)}
              hint="Buka Google Maps → Share → Copy Link"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="latitude"
                label="Latitude (opsional)"
                placeholder="-8.5..."
                value={formData.latitude}
                onChange={(e) => updateField('latitude', e.target.value)}
              />
              <Input
                id="longitude"
                label="Longitude (opsional)"
                placeholder="118.4..."
                value={formData.longitude}
                onChange={(e) => updateField('longitude', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Subscription */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-1">
                <Crown size={18} className="text-purple-600" /> Pilih Paket
              </h2>
              <p className="text-sm text-gray-500 mb-5">Pilih durasi berlangganan yang sesuai anggaranmu</p>

              <div className="space-y-3">
                {[
                  ...(enableFreeTrial ? [{ plan: 'free_2_month' as SubscriptionPlan, popular: true, badge: 'Promo Spesial' }] : []),
                  { plan: '1_month' as SubscriptionPlan, popular: false, badge: '' },
                  { plan: '3_month' as SubscriptionPlan, popular: !enableFreeTrial, badge: !enableFreeTrial ? 'Terpopuler' : '' },
                  { plan: '6_month' as SubscriptionPlan, popular: false, badge: 'Hemat 25%' },
                  { plan: '1_year' as SubscriptionPlan, popular: false, badge: 'Hemat 35%' },
                ].map(({ plan, popular, badge }) => {
                  const price = getSubscriptionPrice(plan)
                  const isSelected = formData.plan === plan
                  return (
                    <button
                      key={plan}
                      onClick={() => updateField('plan', plan)}
                      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-100 bg-gray-50 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{getSubscriptionLabel(plan)}</span>
                            {badge && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                popular
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {badge}
                              </span>
                            )}
                          </div>
                          <span className="text-lg font-black text-purple-700">
                            {formatCurrency(price)}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-red-50 rounded-2xl p-4 border border-red-200 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={16} className="text-red-500" />
                <span className="font-black text-red-800 text-sm">Peringatan Penting!</span>
              </div>
              <p className="text-xs text-red-700 leading-relaxed font-semibold">
                “Akun Anda akan disembunyikan jika masa aktif habis. Silakan perpanjang paket agar tetap mendapatkan pelanggan.”
              </p>
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{errors.submit}</p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {currentStep > 1 && (
            <Button variant="secondary" onClick={prevStep} className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Kembali
            </Button>
          )}
          {currentStep < 4 ? (
            <Button onClick={nextStep} className="flex-1 flex items-center justify-center gap-2">
              Lanjutkan
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading} className="flex-1">
              🚀 Kirim Pendaftaran
            </Button>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
