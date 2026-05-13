'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
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
import { SecurityLoadingScreen } from '@/components/ui/SecurityLoadingScreen'
import { RegistrationSuccess } from '@/components/ui/RegistrationSuccess'
import { SpamDetectedScreen } from '@/components/ui/SpamDetectedScreen'
import {
  CheckCircle, Upload, ArrowRight, ArrowLeft, MapPin,
  Phone, Store, Package, Crown, X, Plus, ShieldAlert, BookOpen, MessageCircle,
  Truck, Shield
} from 'lucide-react'

// Lightweight device fingerprint (no external dep)
function generateFingerprint(): string {
  const nav = navigator
  const raw = [
    nav.language,
    nav.platform,
    nav.hardwareConcurrency,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.userAgent.slice(0, 80),
  ].join('|')
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = Math.imul(31, hash) + raw.charCodeAt(i) | 0
  }
  return 'fp_' + Math.abs(hash).toString(16)
}

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
  const [scanning, setScanning] = useState(false)  // security loading screen
  const [success, setSuccess] = useState(false)
  const [spamDetected, setSpamDetected] = useState(false)
  const [spamData, setSpamData] = useState<any>(null)
  const [adminSettings, setAdminSettings] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [phoneChecking, setPhoneChecking] = useState(false)
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null)
  const fingerprintRef = useRef<string>('')
  const honeypotRef = useRef<string>('')  // stays empty for real users
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
  const [hashtagInput, setHashtagInput] = useState('')
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    owner_name: '',
    phone: '',
    category_id: '',
    description: '',
    maps_link: '',
    latitude: '',
    longitude: '',
    address_detail: '',
    hashtags: [],
    is_cod: false,
    vehicle_type: '',
    service_area: '',
    job_title: '',
    job_description: '',
    job_requirements: '',
    plan: '1_month',
  })

  useEffect(() => {
    getSettings().then(res => {
      setEnableFreeTrial(!!res.enableFreeTrial)
      setAdminSettings(res)
    }).catch(console.error)
    if (typeof window !== 'undefined') {
      fingerprintRef.current = generateFingerprint()
    }
  }, [])

  // Real-time phone uniqueness check (debounced 700ms)
  useEffect(() => {
    const phone = formData.phone
    if (!phone || phone.length < 8) { setPhoneAvailable(null); return }
    setPhoneChecking(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/registration/check-phone?phone=${encodeURIComponent(phone)}`)
        const json = await res.json()
        setPhoneAvailable(json.available)
      } catch { setPhoneAvailable(null) }
      setPhoneChecking(false)
    }, 700)
    return () => clearTimeout(t)
  }, [formData.phone])

  const updateField = (field: keyof VendorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleAddHashtag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = hashtagInput.trim().replace(/^#/, '')
      if (tag && !formData.hashtags?.includes(tag)) {
        updateField('hashtags', [...(formData.hashtags || []), tag])
      }
      setHashtagInput('')
    }
  }

  const removeHashtag = (tag: string) => {
    updateField('hashtags', (formData.hashtags || []).filter(t => t !== tag))
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
      if (!formData.address_detail?.trim()) newErrors.address_detail = 'Alamat detail wajib diisi'
      if ((formData.hashtags || []).length < 4) newErrors.hashtags = 'Minimal berikan 4 hashtag'
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
    // Block if phone already taken
    if (phoneAvailable === false) {
      setErrors({ phone: 'Nomor WhatsApp ini sudah terdaftar.' })
      setCurrentStep(1)
      return
    }

    // Show security loading screen
    setScanning(true)
  }

  // Called when security animation completes
  const handleScanComplete = async () => {
    try {
      // Step 1: Submit via secure API (handles spam check + vendor insert)
      const res = await fetch('/api/registration/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          fingerprint_id: fingerprintRef.current,
          honeypot: honeypotRef.current,
        }),
      })
      const data = await res.json()

      if (data.spam_detected || data.error === 'phone_duplicate' || data.error === 'rate_limited') {
        setScanning(false)
        setSpamData(data)
        setSpamDetected(true)
        return
      }

      if (!res.ok) {
        setScanning(false)
        setErrors({ submit: data.message || 'Terjadi kesalahan saat menyimpan data. Coba lagi.' })
        setCurrentStep(1)
        return
      }

      const vendorId = data.vendor_id

      // Step 2: Upload media files using the vendor_id returned
      const uploadMedia = async (file: File, indexType: string) => {
        const ext = file.name.split('.').pop()
        const path = `vendors/${vendorId}/${indexType}_${Date.now()}.${ext}`
        const { data: uploaded } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600' })
        if (uploaded) {
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
          await supabase.from('media').insert({ vendor_id: vendorId, type: indexType.startsWith('vid') ? 'video' : 'image', url: urlData.publicUrl })
          return urlData.publicUrl
        }
        return null
      }

      if (thumbnail) await uploadMedia(thumbnail, 'thumb')
      if (video) await uploadMedia(video, 'video')
      for (let i = 0; i < gallery.length; i++) await uploadMedia(gallery[i], `gal_${i}`)

      // Upload item images
      if (formData.category_id === 'food') {
        for (const m of menus.filter(m => m.name && m.image)) {
          const ext = m.image!.name.split('.').pop()
          const path = `vendors/${vendorId}/menu_${Date.now()}.${ext}`
          const { data: up } = await supabase.storage.from('media').upload(path, m.image!, { cacheControl: '3600' })
          if (up) {
            const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
            await supabase.from('products').update({ image_url: urlData.publicUrl }).eq('vendor_id', vendorId).eq('name', m.name)
          }
        }
      }

      setScanning(false)
      setSuccess(true)
    } catch (err: any) {
      console.error('Registration Error:', err)
      setScanning(false)
      setErrors({ submit: err?.message || 'Terjadi kesalahan. Coba lagi.' })
    }
  }

  // ── Screen states ──
  if (scanning) {
    return <SecurityLoadingScreen duration={5500} onComplete={handleScanComplete} />
  }

  if (success) {
    return <RegistrationSuccess />
  }

  if (spamDetected) {
    return (
      <SpamDetectedScreen
        blockReasons={spamData?.block_reasons || []}
        similarVendors={spamData?.similar_vendors || []}
        securityFlag={spamData?.security_flag}
        adminWhatsapp={adminSettings?.whatsapp}
        adminEmail={adminSettings?.email}
        onRetry={() => { setSpamDetected(false); setSpamData(null); setCurrentStep(1) }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-lg mx-auto px-4 pt-5 pb-32 relative z-10 isolate">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Daftar Sebagai Mitra</h1>
          <p className="text-sm text-gray-500">Lengkapi data usahamu untuk tampil di DompuOnline</p>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl p-5 mb-8 border border-gray-100 relative z-20">
          <div className="flex gap-3 mb-4">
            <Link href="/panduan" className="flex-1">
              <div className="bg-purple-50 hover:bg-purple-100 transition-colors rounded-xl p-4 text-center h-full border border-purple-100">
                <BookOpen className="text-purple-600 mx-auto mb-2" size={24} />
                <span className="text-[10px] font-black text-purple-900 block uppercase tracking-wide">Panduan Pendaftaran</span>
              </div>
            </Link>
            <Link href="/contact" className="flex-1">
              <div className="bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl p-4 text-center h-full border border-blue-100">
                <MessageCircle className="text-blue-600 mx-auto mb-2" size={24} />
                <span className="text-[10px] font-black text-blue-900 block uppercase tracking-wide">Chat Admin</span>
              </div>
            </Link>
          </div>
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex gap-3 text-xs text-gray-500 leading-relaxed">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <BookOpen size={14} className="text-purple-500" />
              </div>
              <p><span className="text-purple-700 font-bold">Panduan:</span> Pelajari langkah-langkah, syarat pendaftaran, serta aturan platform agar tokomu lancar dikelola.</p>
            </div>
            <div className="flex gap-3 text-xs text-gray-500 leading-relaxed">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <MessageCircle size={14} className="text-blue-500" />
              </div>
              <p><span className="text-blue-700 font-bold">Kontak Admin:</span> Gunakan ini jika butuh bantuan teknis saat upload berkas atau ingin konfirmasi langganan.</p>
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
            <div>
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
              {phoneChecking && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <span className="inline-block w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  Memeriksa ketersediaan nomor...
                </p>
              )}
              {!phoneChecking && phoneAvailable === false && (
                <p className="text-xs text-red-500 mt-1">⚠️ Nomor WhatsApp ini sudah terdaftar di sistem kami.</p>
              )}
              {!phoneChecking && phoneAvailable === true && formData.phone.length >= 8 && (
                <p className="text-xs text-green-600 mt-1">✓ Nomor WhatsApp tersedia</p>
              )}
            </div>
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

        <Textarea
          id="address_detail"
          label="Alamat Detail (Lengkap)"
          placeholder="Contoh: Jl. Mahoni No. 12, Samping Toko Serba Ada, Kel. Bada"
          rows={2}
          value={formData.address_detail}
          onChange={(e) => updateField('address_detail', e.target.value)}
          error={errors.address_detail}
          required
        />

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Hashtag Discovery (Min. 4) <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.hashtags?.map((tag) => (
              <span key={tag} className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-purple-200">
                #{tag}
                <button onClick={() => removeHashtag(tag)} className="hover:text-purple-900"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">#</span>
            <input
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleAddHashtag}
              placeholder="Ketik tag lalu tekan Enter (Contoh: kuliner, pedas, murah)"
              className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          {errors.hashtags && <p className="text-xs text-red-500 mt-1">{errors.hashtags}</p>}
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <input
            type="checkbox"
            id="is_cod"
            checked={formData.is_cod}
            onChange={(e) => updateField('is_cod', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="is_cod" className="text-sm font-bold text-gray-700 cursor-pointer flex items-center gap-2">
            <Truck size={16} className="text-gray-400" /> Bisa COD (Bayar di Tempat)
          </label>
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
                  ...(enableFreeTrial ? [{ plan: 'free_1_month' as SubscriptionPlan, popular: true, badge: 'Promo Spesial' }] : []),
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
            <>
              {/* Honeypot — hidden from real users, catches bots */}
              <input
                type="text"
                name="website"
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
                value={honeypotRef.current}
                onChange={(e) => { honeypotRef.current = e.target.value }}
              />
              <Button onClick={handleSubmit} loading={loading} className="flex-1 flex items-center justify-center gap-2">
                <Shield size={16} /> Kirim dengan Aman
              </Button>
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
