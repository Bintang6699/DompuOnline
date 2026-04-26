import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export const dynamic = 'force-dynamic'
import { VendorCard } from '@/components/vendors/VendorCard'
import { createAdminClient } from '@/lib/supabase'
import { Vendor } from '@/lib/types'
import { Search } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export const metadata = {
  title: 'Cari di DompuOnline',
}

const adminSupabase = createAdminClient()

async function searchVendors(query: string): Promise<Vendor[]> {
  if (!query.trim()) return []
  try {
    const { data, error } = await adminSupabase
      .from('vendors')
      .select(`
        *,
        categories(id, name, icon, slug),
        media(id, type, url),
        ratings(quality_score, cleanliness_score, trust_score)
      `)
      .eq('status', 'approved')
      .eq('subscription_status', 'active')
      .gte('subscription_end', new Date().toISOString())
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,owner_name.ilike.%${query}%,hashtags.cs.{${query}}`)
      .order('is_featured', { ascending: false })
      .limit(20)
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const vendors = q ? await searchVendors(q) : []

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="max-w-lg mx-auto px-4 pt-5 pb-28">
        {q ? (
          <>
            <div className="mb-5">
              <h1 className="text-xl font-black text-gray-900">
                Hasil pencarian: <span className="text-purple-600">&quot;{q}&quot;</span>
              </h1>
              <p className="text-sm text-gray-500">{vendors.length} mitra ditemukan</p>
            </div>
            {vendors.length > 0 ? (
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="font-semibold text-gray-700 mb-1">Mitra Tidak Ditemukan</p>
                <p className="text-sm text-gray-400">Coba kata kunci lain atau jelajahi kategori</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-purple-200 mb-4" />
            <p className="text-lg font-bold text-gray-700 mb-1">Cari Mitra di Dompu</p>
            <p className="text-sm text-gray-400">Ketik nama usaha, kategori, atau jenis layanan</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
