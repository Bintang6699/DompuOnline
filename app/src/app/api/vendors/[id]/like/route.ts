import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc('increment_likes', { vendor_id: id })

    if (error) {
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
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
