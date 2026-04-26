'use server'

import { createAdminClient } from '@/lib/supabase'

export async function getPublicVendors() {
  const adminSupabase = createAdminClient()
  
  try {
    const { data } = await adminSupabase
      .from('vendors')
      .select(`
        *,
        categories(name, slug, icon),
        media(id, type, url),
        ratings(quality_score, cleanliness_score, trust_score),
        products(price),
        services(price)
      `)
      .eq('status', 'approved')
      .gte('subscription_end', new Date().toISOString())
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    return data || []
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return []
  }
}
