'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'
import { Vendor, Product, Service } from '@/lib/types'
import { buildWhatsAppUrl, buildPhoneUrl, formatDate, formatCurrency, cn } from '@/lib/utils'
import { notFound, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  MessageCircle, Phone, MapPin, Star, Crown, CheckCircle, ArrowLeft,
  Clock, Package, Briefcase, Wrench, ShoppingCart, Plus, Minus, X, ArrowRight, Truck, Navigation, Heart
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { WhatsAppCTA } from '@/components/vendors/WhatsAppCTA'
import { ShareButton } from '@/components/ui/ShareButton'
import { ImageSlider } from '@/components/vendors/ImageSlider'
import Link from 'next/link'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'product' | 'service'
}

interface Props {
  params: Promise<{ id: string }>
}

export default function VendorDetailPage({ params }: Props) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [buyerName, setBuyerName] = useState('')
  const [id, setId] = useState<string | null>(null)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    async function fetchVendor() {
      try {
        const { data } = await supabase
          .from('vendors')
          .select(`
            *,
            categories(id, name, icon, slug),
            media(id, type, url),
            ratings(quality_score, cleanliness_score, trust_score, notes),
            products(id, name, price, description, image_url),
            services(id, title, description, price),
            jobs(id, title, description, requirements, salary_min, salary_max)
          `)
          .eq('id', id)
          .eq('status', 'approved')
          .eq('subscription_status', 'active')
          .gte('subscription_end', new Date().toISOString())
          .single()
        
        if (data) {
          setVendor(data as Vendor)
          setLikes(data.likes_count || 0)
          const likedVendors = JSON.parse(localStorage.getItem('liked_vendors') || '[]')
          if (likedVendors.includes(data.id)) {
            setIsLiked(true)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchVendor()
  }, [id])

  const addToCart = (item: Product | Service, type: 'product' | 'service') => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { 
        id: item.id, 
        name: 'name' in item ? item.name : item.title, 
        price: item.price || 0, 
        quantity: 1, 
        type 
      }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0))
  }

  const totalPrice = cart.reduce((acc, current) => acc + current.price * current.quantity, 0)

  const buildCartMessage = () => {
    if (!vendor) return ''
    let msg = `*ORDER BARU - DOMPUONLINE*\n`
    msg += `--------------------------\n`
    msg += `👤 *Nama Pemesan:* ${buyerName}\n`
    msg += `🏪 *Toko:* ${vendor.name}\n\n`
    msg += `*DAFTAR PESANAN:*\n`
    
    cart.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.name} (${item.quantity}x) - ${formatCurrency(item.price * item.quantity)}\n`
    })
    
    msg += `\n💰 *TOTAL PEMBAYARAN: ${formatCurrency(totalPrice)}*\n`
    msg += `--------------------------\n`
    msg += `Mohon segera dikonfirmasi ya, terima kasih! 🙏`

    return `https://wa.me/${vendor.phone.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(msg)}`
  }

  const handleLike = async () => {
    if (!vendor || isLiked) return
    try {
      const res = await fetch(`/api/vendors/${vendor.id}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes_count)
        setIsLiked(true)
        const likedVendors = JSON.parse(localStorage.getItem('liked_vendors') || '[]')
        localStorage.setItem('liked_vendors', JSON.stringify([...likedVendors, vendor.id]))
      }
    } catch (err) {
      console.error('Error liking vendor:', err)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  )
  if (!vendor) notFound()

  const images = vendor.media?.filter((m) => m.type === 'image') || []
  const videos = vendor.media?.filter((m) => m.type === 'video') || []
  const coverImage = images[0]?.url
  const rating = vendor.ratings?.[0]
  const avgRating = rating
    ? ((rating.quality_score + rating.cleanliness_score + rating.trust_score) / 3).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="max-w-lg mx-auto pb-48">
        {/* Back */}
        <div className="px-4 pt-4">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>

        {/* Gallery / Image Slider */}
        <div className="mx-4 mt-3 rounded-2xl overflow-hidden shadow-sm bg-purple-50 relative">
          <ImageSlider images={images} alt={vendor.name} />
          {vendor.is_featured && (
            <div className="absolute top-3 left-3 z-10">
              <span className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg featured-pulse">
                <Crown size={11} /> UNGGULAN
              </span>
            </div>
          )}
        </div>

        <div className="px-4 mt-5 space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">{vendor.name}</h1>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <Star size={10} className="text-purple-600 fill-purple-600" />
                  </div>
                  <p className="text-sm font-semibold">
                    Pemilik: <span className="text-gray-900">{vendor.owner_name}</span>
                  </p>
                </div>
              </div>
              {avgRating && (
                <div className="flex flex-col items-center bg-yellow-50 rounded-2xl p-3 min-w-[64px] border border-yellow-100 shadow-sm">
                  <Star size={20} className="text-yellow-400 fill-yellow-400 mb-0.5" />
                  <span className="text-lg font-black text-gray-800 leading-none">{avgRating}</span>
                  <span className="text-[8px] font-bold text-yellow-600 uppercase tracking-tighter mt-1">Rating</span>
                </div>
              )}
            </div>

            {/* Tags & Status */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant={vendor.categories?.slug === 'kuliner' ? 'kuliner' : 'outline'}>
                {vendor.categories?.name}
              </Badge>
              <Badge variant="success">
                <CheckCircle size={10} className="mr-1" /> Terverifikasi
              </Badge>
              {vendor.is_cod && (
                <Badge variant="blue">
                  <Truck size={10} className="mr-1" /> Bisa COD
                </Badge>
              )}
              <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-bold border border-gray-100">
                <Clock size={10} /> Aktif · {formatDate(vendor.created_at)}
              </div>
            </div>

            {/* Actions Row */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleLike}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs transition-all border-2 active:scale-95 ${
                  isLiked
                  ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200 animate-in zoom-in duration-300'
                  : 'bg-white border-red-100 text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                {likes} DISUKAI
              </button>
              <ShareButton
                title={vendor.name}
                text={`Cek ${vendor.name} di DompuOnline! ${vendor.description.slice(0, 100)}...`}
                url={`/vendor/${vendor.id}`}
                className="flex items-center justify-center gap-2 py-3 bg-purple-50 text-purple-600 rounded-2xl font-black text-xs border-2 border-purple-100 hover:bg-purple-100 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className={cn(
                "text-sm text-gray-600 leading-relaxed whitespace-pre-wrap transition-all duration-300 relative",
                !isDescriptionExpanded && "max-h-24 overflow-hidden"
              )}>
                {vendor.description}
                {!isDescriptionExpanded && vendor.description.length > 150 && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
              {vendor.description.length > 150 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-purple-600 text-xs font-black uppercase tracking-wider flex items-center gap-1"
                >
                  {isDescriptionExpanded ? (
                    <>Tutup <Minus size={14} /></>
                  ) : (
                    <>Baca Selengkapnya <Plus size={14} /></>
                  )}
                </button>
              )}
            </div>

            {/* Hashtags */}
            {vendor.hashtags && vendor.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-5 mt-5 border-t border-gray-50">
                {vendor.hashtags.map(tag => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-[10px] font-black text-purple-600 bg-purple-50/50 px-3 py-1.5 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Location Detail */}
          {vendor.address_detail && (
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
               <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                    <MapPin size={18} className="text-purple-600" />
                 </div>
                 Lokasi & Alamat
               </h2>
               <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                 <p className="text-sm text-gray-600 leading-relaxed">{vendor.address_detail}</p>
               </div>
               {vendor.maps_link && (
                 <a
                   href={vendor.maps_link}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-[0.98] text-sm uppercase tracking-wider"
                 >
                   <Navigation size={18} /> LIHAT DI GOOGLE MAPS
                 </a>
               )}
            </div>
          )}

          {/* Rating Detail */}
          {rating && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                Penilaian Admin
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Kualitas', score: rating.quality_score },
                  { label: 'Kebersihan', score: rating.cleanliness_score },
                  { label: 'Kepercayaan', score: rating.trust_score },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-28 shrink-0">{r.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full"
                        style={{ width: `${(r.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-800 w-8 text-right">{r.score}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {vendor.products && vendor.products.length > 0 && (
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                   <Package size={18} className="text-purple-600" />
                </div>
                Menu & Produk
              </h2>
              <div className="space-y-4">
                {vendor.products.map((p) => {
                  const inCart = cart.find(c => c.id === p.id)
                  return (
                    <div key={p.id} className="group relative bg-gray-50/50 rounded-[20px] p-3 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300">
                      <div className="flex gap-4">
                        {p.image_url ? (
                          <div className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                            <Image 
                              src={p.image_url} 
                              alt={p.name} 
                              width={96}
                              height={96}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <div className="shrink-0 w-24 h-24 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-200">
                            <Package size={32} />
                          </div>
                        )}
                        
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <p className="font-black text-base text-gray-900 leading-tight mb-1">{p.name}</p>
                            {p.description && (
                              <p className="text-[11px] text-gray-400 leading-snug line-clamp-2 italic">
                                {p.description}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <p className="text-base font-black text-purple-600">
                              {formatCurrency(p.price)}
                            </p>
                            <div className="shrink-0">
                              {inCart ? (
                                <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm border border-purple-100">
                                  <button onClick={() => removeFromCart(p.id)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><Minus size={14} /></button>
                                  <span className="text-xs font-black px-1 min-w-[20px] text-center text-purple-700">{inCart.quantity}</span>
                                  <button onClick={() => addToCart(p, 'product')} className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-purple-700 transition-all"><Plus size={14} /></button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => addToCart(p, 'product')}
                                  className="bg-purple-600 text-white text-[10px] font-black px-5 py-2.5 rounded-full shadow-lg shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                >
                                  <Plus size={14} /> TAMBAH
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Services */}
          {vendor.services && vendor.services.length > 0 && (
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                   <Wrench size={18} className="text-purple-600" />
                </div>
                Layanan & Jasa
              </h2>
              <div className="space-y-4">
                {vendor.services.map((s) => {
                  const inCart = cart.find(c => c.id === s.id)
                  return (
                    <div key={s.id} className="bg-gray-50/50 rounded-[20px] p-4 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-base text-gray-900 mb-1">{s.title}</p>
                        {s.description && <p className="text-[11px] text-gray-400 mb-3 italic">{s.description}</p>}
                        <div className="flex justify-between items-center mt-2 gap-2">
                          <div className="flex-1">
                            {s.price ? (
                              <p className="text-base font-black text-purple-600">{formatCurrency(s.price)}</p>
                            ) : (
                              <Badge variant="secondary" className="normal-case">Hubungi untuk harga</Badge>
                            )}
                          </div>
                          <div className="shrink-0">
                             {s.price ? (
                                inCart ? (
                                  <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm border border-purple-100">
                                    <button onClick={() => removeFromCart(s.id)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><Minus size={14} /></button>
                                    <span className="text-xs font-black px-1 min-w-[20px] text-center text-purple-700">{inCart.quantity}</span>
                                    <button onClick={() => addToCart(s, 'service')} className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-purple-700 transition-all"><Plus size={14} /></button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(s, 'service')}
                                    className="bg-purple-600 text-white text-[10px] font-black px-5 py-2.5 rounded-full shadow-lg shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                  >
                                    <Plus size={14} /> PESAN
                                  </button>
                                )
                             ) : (
                               <WhatsAppCTA 
                                  phone={vendor.phone} 
                                  vendorName={vendor.name} 
                                  isTransport={false}
                                  className="bg-green-600 text-white text-[10px] font-black px-5 py-2.5 rounded-full shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center gap-1.5 uppercase tracking-wider"
                               >
                                 <MessageCircle size={14} /> Tanya Harga
                               </WhatsAppCTA>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Jobs */}
          {vendor.jobs && vendor.jobs.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-purple-600" />
                Lowongan Kerja
              </h2>
              <div className="space-y-4">
                {vendor.jobs.map((j) => (
                  <div key={j.id} className="bg-purple-50 rounded-xl p-4">
                    <p className="font-bold text-gray-800 mb-1">{j.title}</p>
                    {j.description && <p className="text-xs text-gray-600 mb-2">{j.description}</p>}
                    {j.requirements && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Persyaratan:</p>
                        <p className="text-xs text-gray-500">{j.requirements}</p>
                      </div>
                    )}
                    {(j.salary_min || j.salary_max) && (
                      <p className="text-xs font-bold text-purple-600 mt-2">
                        Gaji: {formatCurrency(j.salary_min || 0)} {j.salary_max ? `– ${formatCurrency(j.salary_max)}` : '+'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Video Profil */}
          {videos.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm mt-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600 text-lg">🎥</span> Video Profil
              </h2>
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-black">
                <video src={videos[0].url} className="w-full h-full object-contain" controls />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cart Summary Bar & Checkout Modal */}
      {cart.length > 0 && (
        <>
          <div className="fixed bottom-24 left-0 right-0 px-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
             <button 
               onClick={() => setShowCart(true)}
               className="max-w-lg mx-auto w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between group overflow-hidden relative"
             >
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center relative">
                    <ShoppingCart size={20} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-purple-700">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-200">Total Pesanan</p>
                    <p className="text-sm font-black">{formatCurrency(totalPrice)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-black text-sm">
                  Lanjut Bayar <ArrowRight size={16} />
                </div>
             </button>
          </div>

          {showCart && (
            <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
               <div className="bg-white rounded-t-[32px] w-full max-w-lg p-6 animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-gray-900">Konfirmasi Pesanan</h3>
                    <button onClick={() => setShowCart(false)} className="p-2 bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
                  </div>

                  <div className="max-h-[30vh] overflow-auto mb-6 space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                         <div>
                           <p className="font-bold text-gray-800">{item.name}</p>
                           <p className="text-[10px] text-gray-400">{item.quantity} x {formatCurrency(item.price)}</p>
                         </div>
                         <p className="font-black text-purple-600">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2">
                       <p className="font-black text-gray-900">Total</p>
                       <p className="font-black text-purple-700 text-lg">{formatCurrency(totalPrice)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Nama Lengkap Kamu</label>
                       <input 
                         type="text" 
                         value={buyerName}
                         onChange={(e) => setBuyerName(e.target.value)}
                         placeholder="Contoh: Ahmad Dompu"
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
                       />
                       <p className="text-[10px] text-gray-400 mt-1.5 italic">*Nama akan muncul di pesan WhatsApp penjual</p>
                    </div>

                    <button 
                      onClick={() => {
                        if (!buyerName.trim()) return alert('Masukkan namamu dulu ya!')
                        window.open(buildCartMessage(), '_blank')
                      }}
                      className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                        buyerName.trim() 
                        ? 'bg-green-600 text-white shadow-green-100' 
                        : 'bg-gray-200 text-gray-400 pointer-events-none'
                      }`}
                    >
                      <MessageCircle size={20} /> {buyerName.trim() ? 'Kirim Pesanan ke WA' : 'Lengkapi Nama'}
                    </button>
                    <p className="text-center text-[10px] text-gray-400">Pembayaran disepakati langsung dengan penjual via WhatsApp.</p>
                  </div>
               </div>
            </div>
          )}
        </>
      )}

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-28 left-0 right-0 px-4 z-40 pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          {cart.length === 0 ? (
            <WhatsAppCTA 
              phone={vendor.phone}
              vendorName={vendor.name}
              isTransport={vendor.categories?.slug === 'transport'}
              className="btn-whatsapp w-full text-white font-black text-base py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_25px_-5px_rgba(34,197,94,0.4)] active:scale-[0.98] transition-all uppercase tracking-wider"
            >
              <MessageCircle size={22} />
              {vendor.categories?.slug === 'transport' ? 'Pesan Ojek/Mobil' : 'Contact via WhatsApp'}
            </WhatsAppCTA>
          ) : (
             <button
               onClick={() => setShowCart(true)}
               className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-4 shadow-[0_8px_25px_-5px_rgba(147,51,234,0.4)] flex items-center justify-between group overflow-hidden relative active:scale-[0.98] transition-all"
             >
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center relative">
                    <ShoppingCart size={20} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-purple-700">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-purple-200">Total Pesanan</p>
                    <p className="text-sm font-black">{formatCurrency(totalPrice)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-black text-sm">
                  Lanjut Bayar <ArrowRight size={16} />
                </div>
             </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
