'use server'

import { createAdminClient } from '@/lib/supabase'

export async function getPublicVendors(searchQuery?: string) {
  const adminSupabase = createAdminClient()
  
  try {
    let query = adminSupabase
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

    if (searchQuery) {
      const q = searchQuery.trim()
      if (q.startsWith('#')) {
        const tag = q.replace('#', '')
        query = query.contains('hashtags', [tag])
      } else {
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,owner_name.ilike.%${q}%,hashtags.cs.{${q}}`)
      }
    }

    const { data } = await query
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    return data || []
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return []
  }
}
