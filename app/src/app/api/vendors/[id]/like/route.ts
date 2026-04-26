import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Use RPC for atomic increment to avoid race conditions
    // Assuming the 'increment_likes' function exists in Supabase
    // If not, we'll fall back to a raw SQL query or standard increment
    const { data, error } = await supabase.rpc('increment_likes', { vendor_id: id })

    if (error) {
      console.error('RPC Error, falling back to manual increment:', error)
      // Fallback: Manual increment if RPC is missing
      const { data: vendor } = await supabase
        .from('vendors')
        .select('likes_count')
        .eq('id', id)
        .single()

      const newCount = (vendor?.likes_count || 0) + 1

      const { data: updated, error: updateError } = await supabase
        .from('vendors')
        .update({ likes_count: newCount })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return NextResponse.json({ likes_count: updated.likes_count })
    }

    return NextResponse.json({ likes_count: data })
  } catch (error: Error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
