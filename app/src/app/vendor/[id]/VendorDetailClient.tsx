'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'
import { Vendor, Product, Service } from '@/lib/types'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { notFound, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  MessageCircle, MapPin, Star, Crown, CheckCircle, ArrowLeft,
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

export default function VendorDetailClient({ params }: Props) {
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

    // Optimistic UI update
    setLikes(prev => prev + 1)
    setIsLiked(true)
    const likedVendors = JSON.parse(localStorage.getItem('liked_vendors') || '[]')
    localStorage.setItem('liked_vendors', JSON.stringify([...likedVendors, vendor.id]))

    try {
      const res = await fetch(`/api/vendors/${vendor.id}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes_count)
      } else {
        // Revert on error
        setLikes(prev => prev - 1)
        setIsLiked(false)
        localStorage.setItem('liked_vendors', JSON.stringify(likedVendors.filter((id: string) => id !== vendor.id)))
      }
    } catch (err) {
      console.error('Error liking vendor:', err)
      // Revert on error
      setLikes(prev => prev - 1)
      setIsLiked(false)
      localStorage.setItem('liked_vendors', JSON.stringify(likedVendors.filter((id: string) => id !== vendor.id)))
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
  const rating = vendor.ratings?.[0]
  const avgRating = rating
    ? ((rating.quality_score + rating.cleanliness_score + rating.trust_score) / 3).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="max-w-lg mx-auto pb-64">
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

        <div className="px-4 mt-6 space-y-10">
          {/* Profile Section */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start gap-6 mb-6">
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
            <div className="flex flex-wrap gap-2.5 mb-8">
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
            <div className="grid grid-cols-2 gap-4 mb-8">
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
            <div className="space-y-4">
              <div className={cn(
                "text-sm text-gray-500 font-medium leading-relaxed whitespace-pre-wrap transition-all duration-300 relative",
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
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
               <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                    <MapPin size={20} className="text-purple-600" />
                 </div>
                 Lokasi & Alamat
               </h2>
               <div className="bg-gray-50 rounded-[24px] p-5 mb-6 border border-gray-100">
                 <p className="text-sm text-gray-600 font-medium leading-relaxed">{vendor.address_detail}</p>
               </div>
               {vendor.maps_link && (
                 <a
                   href={vendor.maps_link}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:shadow-lg transition-all active:scale-[0.98] text-sm uppercase tracking-wider shadow-blue-100 shadow-xl"
                 >
                   <Navigation size={20} /> LIHAT DI GOOGLE MAPS
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
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                     <Package size={20} className="text-purple-600" />
                  </div>
                  Menu & Produk
                </h2>
                <Badge variant="outline" className="h-fit">Total {vendor.products.length}</Badge>
              </div>
              <div className="space-y-6">
                {vendor.products.map((p) => {
                  const inCart = cart.find(c => c.id === p.id)
                  return (
                    <div key={p.id} className="group relative bg-white rounded-[24px] sm:rounded-[32px] p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="flex gap-3 sm:gap-6">
                        {p.image_url ? (
                          <div className="shrink-0 w-20 h-20 sm:w-32 sm:h-32 rounded-[16px] sm:rounded-[28px] overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                            <Image 
                              src={p.image_url} 
                              alt={p.name} 
                              width={128}
                              height={128}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <div className="shrink-0 w-20 h-20 sm:w-32 sm:h-32 rounded-[16px] sm:rounded-[28px] bg-purple-50 flex items-center justify-center text-purple-200 border border-purple-100">
                            <Package className="w-8 h-8 sm:w-12 sm:h-12" />
                          </div>
                        )}
                        
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="font-black text-sm sm:text-xl text-gray-900 leading-tight mb-0.5 sm:mb-2 line-clamp-2">{p.name}</h3>
                            {p.description && (
                              <p className="text-[10px] sm:text-sm text-gray-400 leading-relaxed line-clamp-2 font-medium italic">
                                {p.description}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-row items-end justify-between mt-2 sm:mt-4 gap-1">
                            <div className="flex flex-col min-w-0">
                              <span className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1 sm:mb-1.5">Harga</span>
                              <p className="text-[11px] sm:text-xl font-black text-purple-600 leading-none">
                                {formatCurrency(p.price)}
                              </p>
                            </div>
                            <div className="shrink-0">
                              {inCart ? (
                                <div className="flex items-center gap-1.5 sm:gap-3 bg-gray-50 rounded-full p-1 sm:p-2 border border-purple-100 shadow-inner">
                                  <button onClick={() => removeFromCart(p.id)} className="w-6 h-6 sm:w-9 sm:h-9 bg-white rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 shadow-sm transition-all"><Minus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                                  <span className="text-xs sm:text-base font-black px-1 min-w-[16px] sm:min-w-[28px] text-center text-purple-700">{inCart.quantity}</span>
                                  <button onClick={() => addToCart(p, 'product')} className="w-6 h-6 sm:w-9 sm:h-9 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-purple-700 transition-all"><Plus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => addToCart(p, 'product')}
                                  className="bg-purple-600 text-white text-[9px] sm:text-xs font-black px-3 py-1.5 sm:px-7 sm:py-3.5 rounded-full shadow-md shadow-purple-100 hover:bg-purple-700 hover:shadow-purple-200 active:scale-95 transition-all flex items-center gap-1 sm:gap-2 uppercase tracking-wider"
                                >
                                  <Plus className="w-3 h-3 sm:w-[18px] sm:h-[18px]" /> TAMBAH
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
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                     <Wrench size={20} className="text-purple-600" />
                  </div>
                  Layanan & Jasa
                </h2>
              </div>
              <div className="space-y-6">
                {vendor.services.map((s) => {
                  const inCart = cart.find(c => c.id === s.id)
                  return (
                    <div key={s.id} className="bg-white rounded-[20px] sm:rounded-[28px] p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-sm sm:text-lg text-gray-900 mb-1 sm:mb-2 line-clamp-2">{s.title}</h3>
                        {s.description && <p className="text-[10px] sm:text-xs text-gray-400 mb-2 sm:mb-4 font-medium leading-relaxed italic">{s.description}</p>}
                        <div className="flex flex-row justify-between items-end mt-2 sm:mt-4 gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <span className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1 block">Estimasi Biaya</span>
                            {s.price ? (
                              <p className="text-[11px] sm:text-lg font-black text-purple-600 leading-none">{formatCurrency(s.price)}</p>
                            ) : (
                              <Badge variant="secondary" className="normal-case py-0.5 sm:py-1 px-1.5 sm:px-2.5 text-[8px] sm:text-xs">Hubungi</Badge>
                            )}
                          </div>
                          <div className="shrink-0">
                             {s.price ? (
                                inCart ? (
                                  <div className="flex items-center gap-1.5 sm:gap-3 bg-gray-50 rounded-full p-1 sm:p-1.5 border border-purple-100">
                                    <button onClick={() => removeFromCart(s.id)} className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 shadow-sm transition-all"><Minus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                                    <span className="text-xs sm:text-sm font-black px-1 min-w-[16px] sm:min-w-[24px] text-center text-purple-700">{inCart.quantity}</span>
                                    <button onClick={() => addToCart(s, 'service')} className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-purple-700 transition-all"><Plus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(s, 'service')}
                                    className="bg-purple-600 text-white text-[9px] sm:text-[11px] font-black px-3 py-1.5 sm:px-6 sm:py-3 rounded-full shadow-md shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-1 sm:gap-2 uppercase tracking-wider"
                                  >
                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> PESAN
                                  </button>
                                )
                             ) : (
                               <WhatsAppCTA 
                                  phone={vendor.phone} 
                                  vendorName={vendor.name} 
                                  isTransport={false}
                                  className="bg-green-600 text-white text-[9px] sm:text-[11px] font-black px-3 py-1.5 sm:px-6 sm:py-3 rounded-full shadow-md shadow-green-100 hover:bg-green-700 transition-all flex items-center gap-1 sm:gap-2 uppercase tracking-wider"
                               >
                                 <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Tanya
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

      {/* ============================================================ */}
      {/* CHECKOUT CONFIRMATION MODAL — CENTERED DIALOG                */}
      {/* ============================================================ */}
      {showCart && cart.length > 0 && (
        /* Full-screen overlay — klik luar = tutup */
        <div
          className="popup-backdrop fixed inset-0 z-[9999] flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
          onClick={() => setShowCart(false)}
        >
          {/* Card — klik di dalam TIDAK menutup */}
          <div
            className="popup-modal-card bg-white w-full rounded-[28px] shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '82vh', maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* ── HEADER ── */}
            <div style={{ borderBottom: '1px solid #f3f4f6' }} className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#f3eeff' }}>
                  <ShoppingCart size={20} color="#7c3aed" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900" style={{ fontSize: '15px', lineHeight: 1.2 }}>
                    Konfirmasi Pesanan
                  </h3>
                  <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, marginTop: 2 }}>
                    {cart.reduce((a, b) => a + b.quantity, 0)} item dipilih
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="active:scale-90 transition-transform"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  backgroundColor: '#f3f4f6', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={17} color="#6b7280" />
              </button>
            </div>

            {/* ── SCROLLABLE BODY ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Daftar item */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {cart.map((item, i) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingTop: 12, paddingBottom: 12,
                      borderBottom: i < cart.length - 1 ? '1px solid #f9fafb' : 'none',
                    }}
                  >
                    <div style={{ minWidth: 0, paddingRight: 12 }}>
                      <p style={{ fontWeight: 900, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, marginTop: 2 }}>
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p style={{ fontWeight: 900, fontSize: 13, color: '#7c3aed', whiteSpace: 'nowrap' }}>
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                  borderRadius: 20, padding: '14px 18px',
                  border: '1px solid #ddd6fe',
                }}
              >
                <div>
                  <p style={{ fontSize: 9, fontWeight: 900, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
                    Total Pembayaran
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#6d28d9', lineHeight: 1 }}>
                    {formatCurrency(totalPrice)}
                  </p>
                </div>
                <span style={{ fontSize: 28 }}>🛒</span>
              </div>

              {/* Input nama pembeli */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 900, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.18em', display: 'block', marginBottom: 8 }}>
                  Nama Lengkap Kamu
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Contoh: Ahmad Dompu"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#f9fafb',
                    border: `2px solid ${buyerName.trim() ? '#a78bfa' : '#e5e7eb'}`,
                    borderRadius: 16, padding: '13px 18px',
                    fontSize: 14, fontWeight: 700, color: '#111827',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                />
                <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 6, fontStyle: 'italic' }}>
                  *Nama akan muncul di pesan WhatsApp penjual
                </p>
              </div>
            </div>

            {/* ── ACTION FOOTER ── */}
            <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 24px 20px' }} className="shrink-0">
              <button
                onClick={() => {
                  if (!buyerName.trim()) return alert('Masukkan namamu dulu ya! 😊')
                  window.open(buildCartMessage(), '_blank')
                }}
                style={{
                  width: '100%',
                  background: buyerName.trim()
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : '#e5e7eb',
                  color: buyerName.trim() ? '#ffffff' : '#9ca3af',
                  border: 'none', borderRadius: 18,
                  padding: '15px 20px',
                  fontWeight: 900, fontSize: 13,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: buyerName.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: buyerName.trim() ? '0 8px 24px rgba(34,197,94,0.35)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <MessageCircle size={20} />
                {buyerName.trim() ? 'Kirim Pesanan via WhatsApp' : 'Lengkapi Nama Dulu'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 9, color: '#d1d5db', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 10 }}>
                Pembayaran disepakati langsung dengan penjual
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Wrapper untuk sticky bottom bar — hanya tampil saat ada item di cart */}
      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-5 z-40 pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          {cart.length === 0 ? (
            <WhatsAppCTA
              phone={vendor.phone}
              vendorName={vendor.name}
              isTransport={vendor.categories?.slug === 'transport'}
              className="w-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-white font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all uppercase tracking-wider mx-auto max-w-[80%]"
            >
              <MessageCircle size={18} className="drop-shadow-sm" />
              {vendor.categories?.slug === 'transport' ? 'Pesan Ojek/Mobil' : 'Contact WhatsApp'}
            </WhatsAppCTA>
          ) : (
            <button
              onClick={() => setShowCart(true)}
              className="w-full bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white rounded-[24px] p-4 shadow-[0_12px_40px_-10px_rgba(126,34,206,0.5)] flex items-center justify-between group overflow-hidden relative active:scale-[0.98] transition-all"
            >
              <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center relative shadow-inner">
                  <ShoppingCart size={24} />
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-[3px] border-purple-700 shadow-sm">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-purple-200 uppercase tracking-widest leading-none mb-1">Total Pesanan</p>
                  <p className="text-lg font-black whitespace-nowrap leading-none">{formatCurrency(totalPrice)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-black text-sm relative z-10 bg-white/20 px-4 py-2 rounded-xl">
                BAYAR <ArrowRight size={18} />
              </div>
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
