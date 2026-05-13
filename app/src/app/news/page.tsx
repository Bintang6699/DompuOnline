import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Newspaper } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Berita Lokal Dompu',
  description: 'Berita terkini dan informasi seputar Dompu, NTB',
}


import { createAdminClient } from '@/lib/supabase'

async function getNews(): Promise<any[]> {
  try {
    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('news')
      .select('*, media(id, type, url)')
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export default async function NewsPage() {
  const news = await getNews()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="max-w-lg mx-auto pb-32">
        <div className="gradient-hero text-white px-5 pt-10 pb-12">
          <div className="flex items-center gap-2 mb-3">
             <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
               <Newspaper size={20} className="text-purple-300" />
             </div>
             <span className="text-[10px] font-black text-purple-200 tracking-[0.2em] uppercase">Info Terkini</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Warta <br/>Dompu Online</h1>
          <p className="text-sm text-white/70 mt-3 font-medium">Informasi akurat & terpercaya seputar Dompu</p>
        </div>

        <div className="px-5 mt-[-24px] space-y-6">
          {news.length > 0 ? (
            news.map((item) => (
              <Link href={`/news/${item.id}`} key={item.id} className="block bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-900/5 transition-all group border border-gray-100">
                <div className="relative aspect-[16/10] bg-gray-100">
                  {item.media?.[0]?.url ? (
                    <Image src={item.media[0].url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📰</div>
                  )}
                  {item.category && (
                    <span className="absolute top-4 left-4 bg-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="font-black text-gray-900 text-lg leading-tight mb-3 group-hover:text-purple-600 transition-colors uppercase tracking-tight">{item.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium leading-relaxed">{item.content}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-wider">
                      <Clock size={12} />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    {item.author && <span className="text-[10px] text-purple-600 font-black uppercase bg-purple-50 px-3 py-1 rounded-full">{item.author}</span>}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
              <span className="text-6xl mb-6 block">📰</span>
              <p className="font-black text-gray-900 text-xl">Belum Ada Berita</p>
              <p className="text-sm text-gray-400 mt-2">Nantikan informasi terbaru dari kami!</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

