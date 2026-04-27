import { Metadata, ResolvingMetadata } from 'next'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { createAdminClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Clock, Tag } from 'lucide-react'
import Link from 'next/link'
import { ShareButton } from '@/components/ui/ShareButton'

interface NewsItem {
  id: string
  title: string
  content: string
  author: string
  category: string
  created_at: string
  media: { id: string, type: 'image' | 'video', url: string }[]
}

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params

  const adminSupabase = createAdminClient()
  const { data: news } = await adminSupabase
    .from('news')
    .select('title, content, media(id, type, url)')
    .eq('id', id)
    .single()

  if (!news) {
    return {
      title: 'Berita Tidak Ditemukan',
    }
  }

  const images = news.media?.filter((m: any) => m.type === 'image') || []
  const ogImage = images.length > 0 ? images[0].url : '/logo/logo2.png'

  return {
    title: news.title,
    description: news.content?.slice(0, 160) || 'Baca selengkapnya di DompuOnline.',
    openGraph: {
      title: news.title,
      description: news.content?.slice(0, 160) || 'Baca selengkapnya di DompuOnline.',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
          alt: news.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: news.content?.slice(0, 160) || 'Baca selengkapnya di DompuOnline.',
      images: [ogImage],
    },
  }
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params
  
  const adminSupabase = createAdminClient()
  const { data: news, error } = await adminSupabase
    .from('news')
    .select('*, media(id, type, url)')
    .eq('id', id)
    .single()
  
  if (error || !news) notFound()

  const typedNews = news as NewsItem
  const images = typedNews.media?.filter(m => m.type === 'image') || []
  const videos = typedNews.media?.filter(m => m.type === 'video') || []

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-lg mx-auto pb-32">
        {/* Back Button */}
        <div className="px-5 pt-6">
          <Link 
            href="/news"
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 active:scale-90 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
        </div>

        {/* Content */}
        <article className="px-5 mt-6">
          {/* Category & Date */}
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-purple-200">
              {typedNews.category || 'WARTA'}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <Clock size={14} />
              {formatDate(typedNews.created_at)}
            </span>
          </div>

          <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight mb-6">
            {typedNews.title}
          </h1>

          {/* Author */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center text-purple-600 font-black">
                  {typedNews.author?.[0] || 'A'}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Editor</p>
                  <p className="text-sm font-black text-gray-800 leading-none">{typedNews.author || 'Admin Dompu'}</p>
                </div>
             </div>
             <ShareButton
               title={typedNews.title}
               text={`Baca berita terbaru: ${typedNews.title} di DompuOnline`}
               url={`/news/${typedNews.id}`}
               className="w-10 h-10 bg-gray-50 rounded-full text-gray-400 hover:text-purple-600"
             />
          </div>

          {/* Primary Media */}
          {images.length > 0 && (
            <div className="rounded-[32px] overflow-hidden mb-8 shadow-2xl shadow-purple-900/10 bg-gray-50 border border-gray-100">
              <img src={images[0].url} alt={typedNews.title} className="w-full h-auto block" />
            </div>
          )}

          {/* Article Text */}
          <div className="prose prose-purple max-w-none mb-12">
            {typedNews.content.split('\n').map((para, i) => (
              para.trim() && <p key={i} className="text-gray-700 text-base leading-relaxed mb-4 font-medium">{para}</p>
            ))}
          </div>

          {/* Gallery */}
          {(images.length > 1 || videos.length > 0) && (
            <div className="space-y-8 mt-12 pt-8 border-t border-gray-100">
               <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                 <Tag size={20} className="text-purple-600" />
                 Media Lainnya
               </h3>
               
               <div className="grid grid-cols-2 gap-4">
                  {images.slice(1).map((img) => (
                    <div key={img.id} className="aspect-square rounded-3xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100 group">
                       <Image src={img.url} alt="Gallery" width={300} height={300} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ))}
               </div>

               {videos.map((vid) => (
                 <div key={vid.id} className="aspect-[16/9] rounded-[32px] overflow-hidden bg-black shadow-xl">
                    <video src={vid.url} controls className="w-full h-full object-contain" />
                 </div>
               ))}
            </div>
          )}
        </article>
      </main>
      <BottomNav />
    </div>
  )
}
