import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export const dynamic = 'force-dynamic'
import { VendorCard, VendorCardSkeleton } from '@/components/vendors/VendorCard'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/categories'
import { notFound, redirect } from 'next/navigation'
import { Vendor } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}


export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const cat = CATEGORIES.find((c) => c.slug === slug)
  return {
    title: cat ? `${cat.name} di Dompu` : 'Kategori',
    description: `Temukan layanan ${cat?.name} terpercaya di Dompu`,
  }
}

async function getVendorsByCategory(slug: string): Promise<Vendor[]> {
  try {
    // First get category id by slug
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!cat) return []

    const { data, error } = await supabase
      .from('vendors')
      .select(`
        *,
        categories(id, name, icon, slug),
        media(id, type, url),
        ratings(quality_score, cleanliness_score, trust_score),
        products(price),
        services(price)
      `)
      .eq('category_id', cat.id)
      .eq('status', 'approved')
      .eq('subscription_status', 'active')
      .gte('subscription_end', new Date().toISOString())
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  
  // Jobs have their own dedicated page managed by admin
  if (slug === 'jobs') {
    redirect('/jobs')
  }
  
  const category = CATEGORIES.find((c) => c.slug === slug)

  if (!category || category.slug === 'news') {
    notFound()
  }

  const vendors = await getVendorsByCategory(slug)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="max-w-lg mx-auto pb-32">
        {/* Category Hero */}
        <div className={`bg-gradient-to-br ${category.color} px-4 pt-5 pb-8 text-white`}>
          <div className="text-5xl mb-3">{category.icon}</div>
          <h1 className="text-2xl font-black">{category.name} di Dompu</h1>
          <p className="text-sm text-white/80 mt-1">{category.desc}</p>
          <div className="mt-2">
            <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
              {vendors.length} mitra aktif
            </span>
          </div>
        </div>

        <div className="px-4 mt-5 space-y-4">
          {vendors.length > 0 ? (
            vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <span className="text-5xl mb-4 block">{category.icon}</span>
              <p className="font-semibold text-gray-700 mb-1">Belum Ada Mitra {category.name}</p>
              <p className="text-sm text-gray-400 mb-4">
                Jadilah yang pertama di kategori ini!
              </p>
              <a
                href="/daftar"
                className="btn-primary text-white text-sm font-semibold rounded-xl px-6 py-3 inline-flex items-center gap-2"
              >
                Daftar Sebagai Mitra
              </a>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
