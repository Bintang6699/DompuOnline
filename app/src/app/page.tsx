import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ImageSlider } from '@/components/home/ImageSlider'
import { supabase } from '@/lib/supabase'
import { getSettings } from '@/app/actions/settings'
import { VendorCard } from '@/components/vendors/VendorCard'
import { Vendor, CommunityLink } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, TrendingUp, Shield, MapPin, MessageCircle, Globe, ExternalLink, Mail, ShoppingBag, Newspaper, Wrench, Utensils, Briefcase, Car, Box } from 'lucide-react'

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'

const adminSupabase = createAdminClient()

async function getFeaturedVendors(): Promise<Vendor[]> {
  try {
    const { data } = await adminSupabase
      .from('vendors')
      .select('*, categories(id, name, icon, slug), media(id, type, url), ratings(quality_score, cleanliness_score, trust_score)')
      .eq('status', 'approved')
      .eq('subscription_status', 'active')
      .gte('subscription_end', new Date().toISOString())
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(4)
    return data || []
  } catch { return [] }
}

async function getCategories() {
  try {
    const { data } = await adminSupabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    return data || []
  } catch { return [] }
}

async function getLatestVendors(): Promise<Vendor[]> {
  try {
    const { data, error } = await adminSupabase
      .from('vendors')
      .select('*, categories(id, name, icon, slug), media(id, type, url)')
      .eq('status', 'approved')
      .eq('subscription_status', 'active')
      .gte('subscription_end', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(8)
    return data || []
  } catch { return [] }
}

async function getSliders() {
  try {
    const { data } = await adminSupabase
      .from('sliders')
      .select('*, vendors(id, name, media(url, type))')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    // Map sliders to ensure they always have a media URL
    return (data || []).map(slider => {
      if (!slider.image_url && !slider.video_url && slider.vendors?.media?.[0]) {
        const vendorMedia = slider.vendors.media[0]
        return {
          ...slider,
          type: vendorMedia.type,
          image_url: vendorMedia.type === 'image' ? vendorMedia.url : '',
          video_url: vendorMedia.type === 'video' ? vendorMedia.url : '',
        }
      }
      return slider
    })
  } catch { return [] }
}

async function getLatestNews() {
  try {
    const { data } = await adminSupabase
      .from('news')
      .select('*, media(id, type, url)')
      .order('created_at', { ascending: false })
      .limit(3)
    return data || []
  } catch { return [] }
}

async function getCommunityLinks(): Promise<CommunityLink[]> {
  try {
    const { data } = await adminSupabase
      .from('community_links')
      .select('*')
      .eq('is_active', true)
    return data || []
  } catch { return [] }
}

export default async function HomePage() {
  const categories = await getCategories()
  const settings = await getSettings()
  const [featured, latest, sliders, news, communities] = await Promise.all([
    getFeaturedVendors(),
    getLatestVendors(),
    getSliders(),
    getLatestNews(),
    getCommunityLinks(),
  ])

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <main className="max-w-lg mx-auto pb-28">
        <div className="relative gradient-hero overflow-hidden pb-12">
          {sliders.length > 0 && (
            <div className="relative group">
              <ImageSlider sliders={sliders} />
            </div>
          )}

          <section className="relative z-20 text-white px-5 pt-10">
            <h1 className="text-4xl font-black leading-[1.1] mb-4 tracking-tighter">
              Semua Ada di 
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-200 to-purple-200 animate-gradient">Dompu Online</span>
            </h1>
            <p className="text-sm text-white/70 mb-8 max-w-[280px] leading-relaxed font-bold">
              Platform digital terpercaya untuk UMKM, Berita, dan Lowongan Kerja di Kabupaten Dompu.
            </p>

            <div className="flex gap-4">
              <Link href="/daftar" className="flex-[1.5] bg-white text-purple-900 font-black text-xs py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-900/40 active:scale-95 transition-all text-center">
                DAFTAR MITRA YUK <ArrowRight size={16} />
              </Link>
              <Link href="/search" className="flex-1 bg-white/10 backdrop-blur-xl text-white font-black text-xs py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/20 active:scale-95 transition-all">
                CARI SESUATU
              </Link>
            </div>
          </section>

          <div className="relative z-20 mx-5 mt-10 p-[1.5px] bg-gradient-to-br from-white/30 to-white/5 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[30.5px] px-2 py-6 grid grid-cols-3 divide-x divide-purple-100">
              {[
                { icon: <Shield size={20} className="text-blue-500" />, value: '100%', label: 'Terverifikasi' },
                { icon: <TrendingUp size={20} className="text-green-500" />, value: 'Daily', label: 'Update' },
                { icon: <MapPin size={20} className="text-red-500" />, value: 'Dompu', label: 'Lokal Area' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center px-1">
                  <div className="mb-2.5 p-2.5 bg-gray-50 rounded-2xl">{stat.icon}</div>
                  <span className="font-black text-purple-900 text-sm tracking-tight">{stat.value}</span>
                  <span className="text-[9px] font-black text-gray-400 tracking-wider uppercase">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Section - Unified with Hero */}
          <section className="relative z-20 mt-10 px-5 border-t border-white/10 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                 <h2 className="text-xl font-black text-white tracking-tight drop-shadow-md">Kategori Mitra</h2>
              </div>
              <Link href="/categories" className="text-[10px] font-black text-white/80 hover:text-white uppercase tracking-widest border-b border-white/30 hover:border-white transition-colors pb-0.5">Lihat Semua</Link>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {categories.map((cat) => {
                const catName = (cat.name || '').toLowerCase();
                const getCategoryIcon = () => {
                  if (catName.includes('belanja')) return <ShoppingBag size={24} className="text-purple-600" />;
                  if (catName.includes('berita')) return <Newspaper size={24} className="text-purple-600" />;
                  if (catName.includes('jasa')) return <Wrench size={24} className="text-purple-600" />;
                  if (catName.includes('kuliner')) return <Utensils size={24} className="text-purple-600" />;
                  if (catName.includes('loker')) return <Briefcase size={24} className="text-purple-600" />;
                  if (catName.includes('transport')) return <Car size={24} className="text-purple-600" />;
                  return <Box size={24} className="text-purple-600" />;
                };
                
                const getHref = () => {
                  if (catName.includes('berita')) return '/news';
                  if (catName.includes('loker')) return '/jobs';
                  return `/categories/${cat.slug}`;
                };

                return (
                  <Link key={cat.id} href={getHref()} className="flex flex-col items-center gap-3 active:scale-95 transition-transform group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.15)] flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      {getCategoryIcon()}
                    </div>
                    <span className="text-[10px] font-black text-white uppercase text-center tracking-tight leading-tight line-clamp-1 drop-shadow-md transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>

        <div className="px-5 mt-12 space-y-12">
          {/* Featured Vendors */}
          {featured.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={18} className="text-yellow-400 fill-yellow-400" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Mitra Unggulan</h2>
              </div>
              <div className="flex overflow-x-auto gap-5 pb-6 snap-x snap-mandatory scrollbar-hide -mx-5 px-5">
                {featured.map((vendor) => (
                  <div key={vendor.id} className="w-[88%] sm:w-[300px] shrink-0 snap-center">
                    <VendorCard vendor={vendor} />
                  </div>
                ))}
              </div>
            </section>
          )}



          {/* Latest Vendors */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-purple-600" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Mitra Terbaru</h2>
              </div>
            </div>
            {latest.length > 0 ? (
              <div className="flex overflow-x-auto gap-5 pb-6 snap-x snap-mandatory scrollbar-hide -mx-5 px-5">
                {latest.map((vendor) => (
                  <div key={vendor.id} className="w-[88%] sm:w-[300px] shrink-0 snap-center">
                    <VendorCard vendor={vendor} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-[40px] border border-dashed border-gray-200">
                <span className="text-5xl mb-4 block">🏪</span>
                <p className="font-black text-gray-900 text-lg">Jadilah Yang Pertama!</p>
                <p className="text-sm text-gray-400 mb-6 font-medium">Bantu perkembangan ekonomi lokal Dompu.</p>
                <Link href="/daftar" className="bg-purple-600 text-white text-xs font-black rounded-2xl px-8 py-4 inline-flex items-center gap-2 shadow-xl shadow-purple-200">
                  DAFTARKAN USAHA ANDA
                </Link>
              </div>
            )}
          </section>

          {/* Latest News - Updated Section */}
          <section className="bg-purple-900/5 rounded-[40px] p-8 border border-purple-100">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Info Terkini</h2>
                   <p className="text-[10px] text-purple-600 font-black uppercase tracking-[0.2em] mt-1">Berita Lokal Dompu</p>
                </div>
                <Link href="/news" className="p-3 bg-white rounded-2xl border border-purple-100 text-purple-600 shadow-sm"><ArrowRight size={18}/></Link>
             </div>
             <div className="space-y-6">
                {news.length > 0 ? news.map((item) => (
                  <Link href={`/news/${item.id}`} key={item.id} className="flex gap-4 group bg-white p-4 rounded-[32px] border border-purple-50 hover:shadow-lg transition-all">
                     <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0 relative">
                        {item.media?.[0]?.url ? (
                          <Image src={item.media[0].url} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : ( <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-200">📰</div> )}
                     </div>
                     <div className="flex-1 py-1">
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{item.category || 'Warta'}</span>
                        <h3 className="font-black text-xs text-gray-900 line-clamp-2 mt-1 uppercase leading-snug group-hover:text-purple-600 transition-colors">{item.title}</h3>
                        <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">{formatDate(item.created_at)}</p>
                     </div>
                  </Link>
                )) : ( <p className="text-center text-gray-400 text-sm italic">Belum ada berita terbaru.</p> )}
             </div>
          </section>

          {/* Community Section */}
          <section className="mt-12">
             <div className="bg-indigo-900 rounded-[40px] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                         <Globe size={20} className="text-blue-300" />
                      </div>
                      <div>
                         <h2 className="text-xl font-black tracking-tight">Komunitas Dompu</h2>
                         <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Update & Pengumuman</p>
                      </div>
                   </div>
                   
                   <p className="text-sm text-indigo-100/70 mb-8 font-medium leading-relaxed">
                      Bergabunglah bersama ribuan masyarakat Dompu lainnya untuk mendapatkan informasi fitur terbaru dan pengumuman resmi.
                   </p>

                   <div className="grid grid-cols-1 gap-3">
                      {communities.map((link) => (
                        <a 
                          key={link.id} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-2xl border border-white/10 transition-all group"
                        >
                           <div className="flex items-center gap-3">
                              {link.platform === 'whatsapp_group' || link.platform === 'whatsapp_channel' ? (
                                <MessageCircle size={20} className="text-green-400" />
                              ) : (
                                <Globe size={20} className="text-blue-400" />
                              )}
                              <span className="text-sm font-black uppercase tracking-tight">
                                {link.platform.replace('_', ' ')}
                              </span>
                           </div>
                           <ExternalLink size={16} className="text-white/40 group-hover:text-white transition-all" />
                        </a>
                      ))}
                   </div>
                </div>
             </div>
          </section>

          {/* Premium CTA Banner */}
          <section className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-purple-900/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Shield size={18} className="text-yellow-400" />
                </div>
                <span className="text-[10px] font-black text-purple-200 tracking-[0.2em] uppercase">Special Offer</span>
              </div>
              <h3 className="text-2xl font-black mb-3 tracking-tight">Go Digital Sekarang!</h3>
              <p className="text-sm text-purple-100/70 mb-8 max-w-[280px] leading-relaxed font-medium">
                Dapatkan prioritas pencarian dan badge "Terverifikasi" untuk meningkatkan kepercayaan pelanggan.
              </p>
              <Link href="/daftar" className="bg-white text-purple-900 font-black text-xs py-4 px-8 rounded-2xl inline-flex items-center gap-2 hover:bg-purple-50 transition-all active:scale-95">
                MULAI SEKARANG <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </div>

        {/* Footer Section */}
        <footer className="bg-white pt-12 pb-8 px-6 border-t border-gray-100">
           <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-[28px] flex items-center justify-center mb-6">
                 <span className="text-2xl">🏪</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Dompu Online</h3>
              <p className="text-xs text-gray-400 font-bold mb-8 uppercase tracking-widest max-w-[200px]">
                Platform Digital Terintegrasi Kota Dompu, NTB.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-[300px] mb-10">
                 {settings.whatsapp && (
                   <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" className="flex items-center gap-3 bg-green-50 text-green-700 text-[10px] font-black p-4 rounded-2xl border border-green-100 hover:bg-green-100 transition-colors uppercase">
                     <MessageCircle size={16} /> WhatsApp Admin
                   </a>
                 )}
                 {settings.email && (
                   <a href={`mailto:${settings.email}`} className="flex items-center gap-3 bg-blue-50 text-blue-700 text-[10px] font-black p-4 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors uppercase">
                     <Mail size={16} /> Email Admin
                   </a>
                 )}
                 <Link href="/contact" className="flex items-center gap-3 bg-gray-50 text-gray-500 text-[10px] font-black p-4 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors uppercase">
                   <Globe size={16} /> Pusat Bantuan
                 </Link>
              </div>

              <div className="flex gap-4 mb-10 w-full max-w-[300px]">
                 <Link href="/daftar" className="flex-1 bg-purple-600 text-white text-[10px] font-black p-4 rounded-2xl shadow-lg shadow-purple-100 uppercase text-center flex items-center justify-center">Gabung Mitra</Link>
              </div>

              <div className="w-full h-px bg-gray-50 mb-8" />

              <div className="flex flex-col gap-4 text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} DompuOnline. All Rights Reserved.
                 </p>
                 <p className="text-[9px] font-medium text-gray-300">
                    Didesain & Dikelola untuk Kemajuan UMKM Dompu
                 </p>
              </div>
           </div>
        </footer>
      </main>
      <BottomNav />
    </div>
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}


