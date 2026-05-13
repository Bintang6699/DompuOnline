'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import { notFound, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, MessageCircle, Building2 } from 'lucide-react'
import { ShareButton } from '@/components/ui/ShareButton'

interface JobItem {
  id: string
  title: string
  company_name: string
  description: string
  requirements: string
  contact_info: string
  salary_min: number
  salary_max: number
  location: string
  type: string
  created_at: string
  vendors?: { name: string }
  media: { id: string, type: 'image' | 'video', url: string }[]
}

interface Props {
  params: Promise<{ id: string }>
}

export default function JobDetailClient({ params }: Props) {
  const router = useRouter()
  const [job, setJob] = useState<JobItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    async function fetchJob() {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('*, vendors(name), media_jobs(id, type, url)')
          .eq('id', id)
          .single()
        
        if (data) {
          const jobData = data as any
          setJob({ ...jobData, media: jobData.media_jobs || [] } as JobItem)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id])

  if (loading) return (
     <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black text-purple-600 animate-pulse">
        MENCARI LOWONGAN...
     </div>
  )
  if (!job) notFound()

  const images = job.media?.filter(m => m.type === 'image') || []
  const videos = job.media?.filter(m => m.type === 'video') || []

  const handleApply = () => {
    const message = `Halo, saya tertarik dengan lowongan ${job.title} di ${job.company_name} yang saya lihat di DompuOnline.`
    const phone = job.contact_info.replace(/\D/g, '')
    if (phone.length >= 10) {
      window.open(`https://wa.me/${phone.startsWith('0') ? '62' + phone.slice(1) : phone}?text=${encodeURIComponent(message)}`, '_blank')
    } else {
      alert(`Silakan hubungi: ${job.contact_info}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="max-w-lg mx-auto pb-64">
        <div className="px-5 pt-6 flex items-center justify-between">
           <button 
             onClick={() => router.back()} 
             className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all shadow-sm border border-gray-100"
           >
             <ArrowLeft size={20} />
           </button>
           <ShareButton
             title={job.title}
             text={`Info Loker: ${job.title} di ${job.company_name}. Cek detailnya di DompuOnline!`}
             url={`/jobs/${job.id}`}
             className="w-10 h-10 bg-white rounded-2xl text-gray-400 hover:text-purple-600 shadow-sm border border-gray-100"
           />
        </div>

        {/* Hero Card */}
        <div className="px-5 mt-6">
           <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-200/50 border border-gray-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full translate-x-16 -translate-y-16" />
              
              <div className="relative z-10">
                 <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-purple-200 mb-6">
                   <Building2 size={32} />
                 </div>
                 
                 <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tight">{job.title}</h1>
                 <p className="text-purple-600 font-black text-lg mb-6">{job.company_name || job.vendors?.name}</p>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-wider">
                       <MapPin size={14} className="text-gray-400" />
                       {job.location || 'Dompu'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-wider">
                       <Briefcase size={14} className="text-gray-400" />
                       {job.type || 'Full-time'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-wider col-span-2">
                       <Calendar size={14} className="text-gray-400" />
                       Diposting {formatDate(job.created_at)}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Media / Poster */}
        {images.length > 0 && (
          <div className="px-5 mt-8">
             <div className="rounded-[32px] overflow-hidden shadow-2xl shadow-purple-900/10 bg-white p-2 border border-gray-100">
                <div className="rounded-[24px] overflow-hidden bg-gray-50">
                   <img src={images[0].url} alt="Poster Loker" className="w-full h-auto block" />
                </div>
             </div>
          </div>
        )}

        <div className="px-5 mt-8 space-y-8">
           {/* Section: Description */}
           <section>
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-purple-600 rounded-full" />
                 Deskripsi Pekerjaan
              </h3>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                 <p className="text-gray-600 text-sm leading-relaxed font-medium whitespace-pre-line">
                   {job.description || 'Tidak ada deskripsi spesifik.'}
                 </p>
              </div>
           </section>

           {/* Section: Requirements */}
           <section>
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-purple-600 rounded-full" />
                 Persyaratan
              </h3>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                 <p className="text-gray-600 text-sm leading-relaxed font-medium whitespace-pre-line">
                    {job.requirements || 'Hubungi kontak untuk informasi lebih lanjut.'}
                 </p>
              </div>
           </section>

           {/* Salary Section */}
           {(job.salary_min || job.salary_max) && (
             <section className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-3xl p-6 border border-green-100 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Estimasi Gaji</p>
                   <p className="text-lg font-black text-green-700">
                      {job.salary_min ? formatCurrency(job.salary_min) : 'Nego'}
                      {job.salary_max ? ` – ${formatCurrency(job.salary_max)}` : ''}
                   </p>
                </div>
                <div className="w-12 h-12 bg-green-200/50 rounded-2xl flex items-center justify-center text-green-600">
                   <DollarSign size={24} />
                </div>
             </section>
           )}

           {/* More Media */}
           {(images.length > 1 || videos.length > 0) && (
             <section className="space-y-4">
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-tight">Media Lainnya</h3>
                <div className="grid grid-cols-2 gap-4">
                   {images.slice(1).map((img) => (
                      <div key={img.id} className="aspect-square rounded-3xl overflow-hidden border border-gray-100">
                         <Image src={img.url} alt="Gallery" width={300} height={300} className="w-full h-full object-cover" />
                      </div>
                   ))}
                </div>
                {videos.map((vid) => (
                  <div key={vid.id} className="aspect-video rounded-3xl overflow-hidden bg-black">
                     <video src={vid.url} controls className="w-full h-full object-contain" />
                  </div>
                ))}
             </section>
           )}
        </div>

        {/* Floating Apply CTA */}
        <div className="fixed bottom-24 left-0 right-0 px-5 z-50">
           <div className="max-w-lg mx-auto">
              <button 
                onClick={handleApply}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-purple-900/40 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <MessageCircle size={22} />
                KE WA PERUSAHAAN
              </button>
           </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
