import JobDetailClient from './JobDetailClient'
import { supabase } from '@/lib/supabase'
import { Metadata, ResolvingMetadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params

  // Fetch data
  const { data: job } = await supabase
    .from('jobs')
    .select('title, company_name, description, media_jobs(id, type, url)')
    .eq('id', id)
    .single()

  if (!job) {
    return {
      title: 'Lowongan Tidak Ditemukan',
    }
  }

  const images = job.media_jobs?.filter((m: any) => m.type === 'image') || []
  const ogImage = images.length > 0 ? images[0].url : '/logo/logo2.png'

  return {
    title: `Loker: ${job.title} di ${job.company_name}`,
    description: job.description?.slice(0, 160) || 'Cek lowongan kerja ini di DompuOnline.',
    openGraph: {
      title: `Loker: ${job.title} di ${job.company_name}`,
      description: job.description?.slice(0, 160) || 'Cek lowongan kerja ini di DompuOnline.',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
          alt: job.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Loker: ${job.title} di ${job.company_name}`,
      description: job.description?.slice(0, 160) || 'Cek lowongan kerja ini di DompuOnline.',
      images: [ogImage],
    },
  }
}

export default async function JobDetailPage({ params }: Props) {
  return <JobDetailClient params={params} />
}
