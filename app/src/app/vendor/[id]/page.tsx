'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'
import { Vendor, Product, Service } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { notFound, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MessageCircle, MapPin, Star, CheckCircle, ArrowLeft,
  Package, Briefcase, Wrench, ShoppingCart, Plus, Minus, X, Truck, Navigation, Heart, ChevronRight, ChevronDown
} from 'lucide-react'
import { WhatsAppCTA } from '@/components/vendors/WhatsAppCTA'
import { ShareButton } from '@/components/ui/ShareButton'
import { VendorImageSlider } from '@/components/vendors/VendorImageSlider'
import { motion, AnimatePresence } from 'framer-motion'

export const dynamic = 'force-dynamic'

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
  const [isDescExpanded, setIsDescExpanded] = useState(false)

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

  const avgRating = vendor.ratings?.[0]
    ? ((vendor.ratings[0].quality_score + vendor.ratings[0].cleanliness_score + vendor.ratings[0].trust_score) / 3).toFixed(1)
    : null

  const videos = vendor.media?.filter((m) => m.type === 'video') || []

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Header />

      <main className="max-w-lg mx-auto pb-48">
        {/* Navigation Bar */}
        <div className="px-4 py-4 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-full text-gray-900 active:scale-90 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex gap-2">
             <motion.button
                whileTap={{ scale: 1.3 }}
                onClick={handleLike}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border ${
                  isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-100 text-gray-400'
                }`}
              >
                <Heart size={20} className={isLiked ? 'fill-current' : ''} />
              </motion.button>
              <ShareButton
                title={vendor.name}
                text={`Cek ${vendor.name} di DompuOnline! ${vendor.description.slice(0, 100)}...`}
                url={`/vendor/${vendor.id}`}
                className="w-10 h-10 bg-white border border-gray-100 text-gray-900 rounded-full shadow-sm active:scale-90"
              />
          </div>
        </div>

        {/* Hero Slider */}
        <div className="px-4 mt-4">
          <VendorImageSlider media={vendor.media || []} vendorName={vendor.name} />
        </div>

        <div className="mt-6 space-y-6">
          {/* Header Card */}
          <section className="mx-4 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
             <div className="flex justify-between items-start mb-4 text-balance">
               <div className="flex-1 min-w-0 pr-4">
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-1 uppercase break-words drop-shadow-sm">
                    {vendor.name}
                  </h1>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pemilik</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-sm font-black text-purple-600 truncate uppercase tracking-tight shadow-purple-50">{vendor.owner_name}</span>
                  </div>
               </div>
               {avgRating && (
                <div className="shrink-0 bg-yellow-50 px-3 py-2 rounded-[20px] flex flex-col items-center border border-yellow-100 shadow-inner">
                  <Star size={18} className="text-yellow-400 fill-yellow-400 mb-0.5" />
                  <span className="text-xs font-black text-yellow-700 font-mono leading-none">{avgRating}</span>
                </div>
               )}
             </div>

             {/* Badges Row */}
             <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
               <span className="bg-purple-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-purple-100 flex items-center gap-1.5">
                 <Package size={10} /> {vendor.categories?.name}
               </span>
               <span className="bg-green-50 text-green-600 border border-green-100 text-[9px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-widest shadow-sm">
                 <CheckCircle size={10} /> Terverifikasi
               </span>
               {vendor.is_cod && (
                 <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-widest shadow-sm">
                   <Truck size={10} /> Bisa COD
                 </span>
               )}
               <span className="bg-gray-50 text-gray-500 border border-gray-100 text-[9px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-widest shadow-sm">
                 <Heart size={10} className={isLiked ? 'text-red-500 fill-current' : 'text-red-400'} /> {likes} Menyukai
               </span>
             </div>
          </section>

          {/* Description Section */}
          <section className="mx-4 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 text-balance">
             <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-1.5 h-4 bg-purple-600 rounded-full shadow-lg shadow-purple-200" />
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tentang Usaha</h2>
             </div>

             <div className={`text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                {vendor.description}
             </div>

             {vendor.description && vendor.description.length > 150 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="mt-4 text-purple-600 font-black text-xs uppercase flex items-center gap-1 hover:bg-purple-50 px-3 py-2 rounded-xl transition-colors -ml-3"
                >
                  {isDescExpanded ? 'Tutup' : 'Selengkapnya'}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isDescExpanded ? 'rotate-180' : ''}`} />
                </button>
             )}

             {vendor.hashtags && vendor.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-50">
                {vendor.hashtags.map(tag => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent('#' + tag)}`}
                    className="text-[10px] font-black text-purple-600 bg-purple-50/50 px-4 py-2 rounded-[14px] border border-purple-100/50 hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Location Section */}
          {vendor.address_detail && (
            <section className="mx-4 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
               <div className="flex items-center gap-3 mb-5 px-1">
                  <div className="w-12 h-12 bg-red-50 rounded-[20px] flex items-center justify-center text-red-500 border border-red-100 shadow-inner group">
                    <MapPin size={24} className="group-hover:bounce transition-transform" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 uppercase tracking-tight leading-none mb-1.5">Lokasi & Alamat</h2>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">Dompu, NTB</p>
                  </div>
               </div>

               <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100 shadow-inner overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                    <Navigation size={48} className="text-gray-900" />
                 </div>
                 <p className="text-sm text-gray-600 leading-relaxed font-bold italic relative z-10">&quot;{vendor.address_detail}&quot;</p>
               </div>

               {vendor.maps_link && (
                 <a
                   href={vendor.maps_link}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full bg-blue-600 text-white font-black py-4 rounded-[20px] flex items-center justify-center gap-2 hover:bg-blue-700 transition-all text-sm shadow-xl shadow-blue-100 active:scale-95 uppercase tracking-widest border-b-4 border-blue-800"
                 >
                   <Navigation size={18} /> LIHAT DI GOOGLE MAPS
                 </a>
               )}
            </section>
          )}

          {/* Products / Menu Section */}
          {vendor.products && vendor.products.length > 0 && (
            <section className="mx-4 space-y-6">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 shadow-inner">
                      <Package size={22} className="text-purple-600" />
                   </div>
                   <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none mt-1">Daftar Produk</h2>
                </div>
                <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-2 rounded-full border border-purple-100 uppercase tracking-widest shadow-sm">
                  {vendor.products.length} Menu
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 pb-4">
                {vendor.products.map((p) => {
                  const inCart = cart.find(c => c.id === p.id)
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      className="bg-white rounded-[40px] p-4 border border-gray-100 shadow-sm flex gap-5 hover:shadow-xl transition-all group relative overflow-hidden active:scale-[0.98]"
                    >
                      <div className="relative w-32 h-32 rounded-[32px] overflow-hidden bg-gray-50 shrink-0 border border-gray-100 shadow-inner">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={40} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="font-black text-gray-900 text-base truncate uppercase tracking-tight leading-tight mb-1">{p.name}</h3>
                          {p.description && <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed font-bold italic uppercase tracking-tighter">&quot;{p.description}&quot;</p>}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                          <p className="font-black text-purple-600 text-lg tracking-tighter font-mono">{formatCurrency(p.price)}</p>
                          <div className="shrink-0">
                            {inCart ? (
                              <div className="flex items-center gap-3 bg-purple-600 p-1 rounded-[16px] shadow-lg shadow-purple-100 border-2 border-white/20">
                                <button onClick={() => removeFromCart(p.id)} className="w-8 h-8 bg-white/20 rounded-[12px] flex items-center justify-center text-white active:scale-75 transition-all"><Minus size={14} /></button>
                                <span className="text-[12px] font-black text-white min-w-[20px] text-center font-mono leading-none">{inCart.quantity}</span>
                                <button onClick={() => addToCart(p, 'product')} className="w-8 h-8 bg-white/20 rounded-[12px] flex items-center justify-center text-white active:scale-75 transition-all"><Plus size={14} /></button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(p, 'product')}
                                className="bg-white text-purple-600 border-2 border-purple-600 text-[10px] font-black px-5 py-2.5 rounded-[16px] hover:bg-purple-600 hover:text-white transition-all active:scale-95 uppercase tracking-widest shadow-md"
                              >
                                + TAMBAH
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Services Section */}
          {vendor.services && vendor.services.length > 0 && (
            <section className="mx-4 space-y-6 pt-6 text-balance">
              <div className="flex items-center gap-4 px-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-[20px] flex items-center justify-center shadow-inner border border-indigo-100">
                    <Wrench size={26} className="text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none mt-1">Layanan Jasa</h2>
               </div>
              <div className="grid grid-cols-1 gap-3">
                {vendor.services.map((s) => {
                  const inCart = cart.find(c => c.id === s.id)
                  return (
                    <div key={s.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all active:scale-[0.99] relative overflow-hidden">
                      <div className="flex-1 min-w-0 pr-4 relative z-10">
                        <h3 className="font-black text-gray-900 text-sm group-hover:text-indigo-600 transition-colors uppercase tracking-[0.1em] leading-tight mb-2">{s.title}</h3>
                        {s.description && <p className="text-[10px] text-gray-400 mt-2 font-bold leading-relaxed italic border-l-2 border-gray-200 pl-3 uppercase tracking-tighter">&quot;{s.description}&quot;</p>}
                        <div className="mt-3 flex items-center gap-2">
                           <div className="w-1 h-3 bg-purple-200 rounded-full shadow-inner" />
                           {s.price ? (
                              <p className="text-sm font-black text-purple-600 tracking-tight font-mono leading-none">{formatCurrency(s.price)}</p>
                            ) : (
                              <p className="text-[10px] text-gray-400 font-black italic uppercase tracking-widest leading-none mt-0.5">HUBUNGI SELLER</p>
                            )}
                        </div>
                      </div>
                      <div className="shrink-0 ml-2 relative z-10">
                         {s.price ? (
                            inCart ? (
                              <div className="flex items-center gap-2 bg-purple-600 p-1 rounded-[16px] shadow-lg shadow-purple-100 border-2 border-white/20">
                                <button onClick={() => removeFromCart(s.id)} className="w-8 h-8 bg-white/20 rounded-[12px] flex items-center justify-center text-white active:scale-75"><Minus size={14} /></button>
                                <span className="text-[11px] font-black text-white px-1 min-w-[16px] text-center font-mono">{inCart.quantity}</span>
                                <button onClick={() => addToCart(s, 'service')} className="w-8 h-8 bg-white/20 rounded-[12px] flex items-center justify-center text-white active:scale-75"><Plus size={14} /></button>
                              </div>
                            ) : (
                              <button onClick={() => addToCart(s, 'service')} className="bg-purple-600 text-white text-[10px] font-black px-6 py-4 rounded-[16px] shadow-xl shadow-purple-100 active:scale-95 transition-all uppercase tracking-widest border-b-4 border-purple-800">
                                PESAN
                              </button>
                            )
                         ) : (
                           <WhatsAppCTA
                              phone={vendor.phone}
                              vendorName={vendor.name}
                              isTransport={false}
                              className="bg-green-600 text-white text-[10px] font-black px-5 py-4 rounded-[16px] shadow-xl shadow-green-100 active:scale-95 transition-all uppercase tracking-widest border-b-4 border-green-800"
                           >Tanya Harga</WhatsAppCTA>
                         )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Jobs Section */}
          {vendor.jobs && vendor.jobs.length > 0 && (
            <section className="mx-4 space-y-6 pt-6 pb-4">
               <div className="flex items-center gap-4 px-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-[20px] flex items-center justify-center shadow-inner border border-orange-100">
                    <Briefcase size={26} className="text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none mt-1">Lowongan Kerja</h2>
               </div>
              <div className="grid grid-cols-1 gap-5">
                {vendor.jobs.map((j) => (
                  <div key={j.id} className="bg-indigo-950 rounded-[48px] p-8 text-white relative overflow-hidden group shadow-2xl border border-white/5 active:scale-[0.99] transition-transform">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl group-hover:bg-purple-600/20 transition-all duration-1000" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                         <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Hiring Now</span>
                         </div>
                      </div>
                      <h3 className="font-black text-2xl group-hover:text-purple-300 transition-colors uppercase tracking-tight leading-tight mb-4 break-words shadow-indigo-950">{j.title}</h3>
                      {j.description && <p className="text-xs text-indigo-100/70 mb-8 leading-relaxed font-bold italic tracking-tight uppercase border-l-4 border-white/5 pl-4 leading-tight">&quot;{j.description}&quot;</p>}

                      {j.requirements && (
                        <div className="bg-white/5 backdrop-blur-sm rounded-[32px] p-6 border border-white/10 mb-8 shadow-inner">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3">Syarat & Kualifikasi</p>
                          <p className="text-xs text-indigo-50 leading-relaxed font-medium">{j.requirements}</p>
                        </div>
                      )}

                      {(j.salary_min || j.salary_max) && (
                        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/5">
                          <div className="w-10 h-10 bg-white text-indigo-950 rounded-[18px] flex items-center justify-center shadow-2xl font-black text-xs rotate-3 shadow-indigo-900">Rp</div>
                          <div>
                             <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1 leading-none">Estimasi Gaji</p>
                             <p className="text-lg font-black text-white tracking-tighter font-mono leading-none">
                                {formatCurrency(j.salary_min || 0)} {j.salary_max ? `– ${formatCurrency(j.salary_max)}` : '+'}
                             </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Video Section */}
          {videos.length > 0 && (
            <section className="mx-4 pt-12 pb-8">
              <div className="flex items-center justify-center mb-8 px-4">
                <div className="flex flex-col items-center gap-2">
                   <div className="w-16 h-16 bg-purple-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-purple-200 border-4 border-white active:rotate-12 transition-transform">
                      <MessageCircle size={32} />
                   </div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none mt-2 shadow-purple-50">Video Profil</h2>
                </div>
              </div>
              <div className="aspect-[16/9] rounded-[56px] overflow-hidden bg-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] border-[12px] border-white ring-1 ring-gray-100 scale-[1.03] transition-transform hover:scale-[1.06] duration-700">
                <video src={videos[0].url} className="w-full h-full object-contain shadow-inner" controls />
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Floating Cart Summary (Modern Pill Style) */}
      <AnimatePresence>
        {cart.length > 0 && (
          <>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-24 left-0 right-0 px-6 z-50 pointer-events-none"
            >
               <button
                 onClick={() => setShowCart(true)}
                 className="max-w-lg mx-auto w-full bg-indigo-950 text-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(30,27,75,0.5)] flex items-center justify-between group overflow-hidden relative border-2 border-white/10 pointer-events-auto active:scale-95 transition-transform"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-transparent to-transparent pointer-events-none" />
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-[20px] flex items-center justify-center relative shadow-inner border border-white/10 group-active:scale-90 transition-transform">
                      <ShoppingCart size={28} className="group-hover:rotate-12 transition-transform" />
                      <span className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-4 border-indigo-950 shadow-xl">
                        {cart.reduce((a, b) => a + b.quantity, 0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] leading-none mb-2">Total Belanja</p>
                      <p className="text-xl font-black leading-none tracking-tighter font-mono">{formatCurrency(totalPrice)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.3em] bg-white text-indigo-900 px-6 py-4 rounded-[16px] shadow-2xl active:scale-90 transition-all shadow-white/20">
                    Checkout <ChevronRight size={18} />
                  </div>
               </button>
            </motion.div>

            {/* Modal Checkout Overlay */}
            {showCart && (
              <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/95 backdrop-blur-md px-4 py-4">
                 <motion.div
                   initial={{ y: '100%' }}
                   animate={{ y: 0 }}
                   exit={{ y: '100%' }}
                   transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                   className="bg-white rounded-[64px] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden"
                 >
                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 shadow-xl shadow-purple-200/50" />

                    <div className="flex items-center justify-between mb-10 px-2">
                      <div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">ORDER</h3>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mt-1.5 leading-none">Review Pesanan Anda</p>
                      </div>
                      <button onClick={() => setShowCart(false)} className="w-16 h-16 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all hover:rotate-90 shadow-sm border border-gray-100 active:scale-90"><X size={32} /></button>
                    </div>

                    <div className="max-h-[35vh] overflow-auto mb-10 space-y-4 pr-3 custom-scrollbar">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-6 rounded-[32px] border border-gray-100 group hover:border-purple-200 transition-colors shadow-sm">
                           <div className="pr-6">
                             <p className="font-black text-gray-900 uppercase tracking-tight text-sm leading-tight mb-2 group-hover:text-purple-600 transition-colors">{item.name}</p>
                             <p className="text-[10px] text-purple-600 font-black tracking-widest leading-none">{item.quantity} X {formatCurrency(item.price)}</p>
                           </div>
                           <p className="font-black text-gray-900 text-base tracking-tighter shrink-0 font-mono shadow-white">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mb-10 px-8 bg-purple-900 p-8 rounded-[40px] shadow-2xl border-2 border-white/10 relative overflow-hidden group">
                       <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                       <p className="font-black text-purple-300 uppercase tracking-[0.4em] text-xs relative z-10">Total Akhir</p>
                       <p className="font-black text-white text-3xl tracking-tighter font-mono relative z-10 drop-shadow-lg">{formatCurrency(totalPrice)}</p>
                    </div>

                    <div className="space-y-8">
                      <div className="relative group">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3.5 block px-4 group-focus-within:text-purple-600 transition-colors">Siapa Nama Anda?</label>
                         <input
                           type="text"
                           value={buyerName}
                           onChange={(e) => setBuyerName(e.target.value)}
                           placeholder="Contoh: Ahmad Dompu"
                           className="w-full bg-gray-50 border-4 border-gray-100 rounded-[32px] px-8 py-5 text-base focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-black text-gray-900 placeholder:text-gray-300 shadow-inner"
                         />
                      </div>

                      <button
                        onClick={() => {
                          if (!buyerName.trim()) return alert('Masukkan namamu dulu ya!')
                          window.open(buildCartMessage(), '_blank')
                        }}
                        className={`w-full font-black py-7 rounded-[32px] flex items-center justify-center gap-4 transition-all shadow-2xl ${
                          buyerName.trim()
                          ? 'bg-green-600 text-white shadow-green-200 active:scale-95 border-b-8 border-green-800'
                          : 'bg-gray-100 text-gray-400 pointer-events-none'
                        }`}
                      >
                        <MessageCircle size={28} />
                        <span className="uppercase tracking-[0.3em] text-sm">Kirim via WhatsApp</span>
                      </button>
                    </div>
                 </motion.div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Primary Sticky Bottom CTA (Mobile Optimized) */}
      {cart.length === 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-8 z-40 bg-gradient-to-t from-white via-white/98 to-transparent">
          <div className="max-w-lg mx-auto">
            <WhatsAppCTA 
              phone={vendor.phone}
              vendorName={vendor.name}
              isTransport={vendor.categories?.slug === 'transport'}
              className="w-full bg-green-600 text-white font-black text-base py-6 rounded-[32px] flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(22,163,74,0.4)] active:scale-95 transition-all uppercase tracking-[0.3em] border-b-8 border-green-800 group"
            >
              <MessageCircle size={26} className="group-hover:scale-125 transition-transform" />
              {vendor.categories?.slug === 'transport' ? 'Pesan Sekarang' : 'Hubungi Seller'}
            </WhatsAppCTA>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
