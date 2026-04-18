import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'
import { Briefcase, Building, MapPin, Clock } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

async function getJobs() {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Try to fetch media, but gracefully handle if media_jobs table doesn't exist
    if (data && data.length > 0) {
      try {
        const jobsWithMedia = await Promise.all(
          data.map(async (job) => {
            const { data: mediaData, error: mediaError } = await supabase
              .from('media_jobs')
              .select('id, type, url')
              .eq('job_id', job.id)
            if (mediaError) return { ...job, media: [] }
            return { ...job, media: mediaData || [] }
          })
        )
        return jobsWithMedia
      } catch {
        // media_jobs table doesn't exist yet — return jobs without media
        return data.map(job => ({ ...job, media: [] }))
      }
    }
    return data?.map(job => ({ ...job, media: [] })) || []
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return []
  }
}

export default async function JobsPage() {
  const jobs = await getJobs()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="max-w-lg mx-auto pb-28">
        <div className="gradient-hero text-white px-5 pt-10 pb-12">
          <div className="flex items-center gap-2 mb-3">
             <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
               <Briefcase size={20} className="text-purple-300" />
             </div>
             <span className="text-[10px] font-black text-purple-200 tracking-[0.2em] uppercase">Karir & Kerja</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Lowongan <br/>Kerja Dompu</h1>
          <p className="text-sm text-white/70 mt-3 font-medium">Temukan peluang terbaik untuk masa depanmu</p>
        </div>

        <div className="px-5 -mt-6">
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-white rounded-[40px] p-12 text-center shadow-sm border border-gray-100">
                <Briefcase size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="font-black text-gray-900 text-lg">Belum ada lowongan</p>
                <p className="text-sm text-gray-400 mt-1">Cek kembali secara berkala ya!</p>
              </div>
            ) : (
              jobs.map((job) => {
                const firstImage = job.media?.find((m: any) => m.type === 'image')
                return (
                <Link href={`/jobs/${job.id}`} key={job.id} className="block bg-white rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 transition-all group border border-gray-100">
                  <div className="flex items-start gap-4 mb-4">
                    {firstImage && (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                        <Image src={firstImage.url} alt={job.title} width={64} height={64} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-black text-gray-900 leading-tight group-hover:text-purple-600 transition-colors uppercase tracking-tight line-clamp-1">{job.title}</h2>
                      <div className="flex items-center gap-1.5 text-sm font-black text-purple-600 mt-1 uppercase tracking-tight">
                        <Building size={14} />
                        {job.company_name || 'Perusahaan'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <MapPin size={12} />
                        {job.location || 'Dompu'}
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Clock size={12} />
                        {formatDate(job.created_at)}
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                      {(job.salary_min || job.salary_max) ? (
                        <div className="text-sm font-black text-green-600">
                          {formatCurrency(job.salary_min || 0)} {job.salary_max ? `- ${formatCurrency(job.salary_max)}` : '+'}
                        </div>
                      ) : (
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Gaji Rahasia</div>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-2 rounded-full uppercase tracking-widest group-hover:bg-purple-600 group-hover:text-white transition-all">Detail</span>
                  </div>
                </Link>
              )
              })
            )
}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
