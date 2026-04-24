import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { id } = await params

    const { data: vendor, error: fetchError } = await supabase
      .from('vendors')
      .select('likes_count')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const newLikesCount = (vendor.likes_count || 0) + 1

    const { error: updateError } = await supabase
      .from('vendors')
      .update({ likes_count: newLikesCount })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, likes_count: newLikesCount })
  } catch (error: any) {
    console.error('POST /api/vendors/[id]/like error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
