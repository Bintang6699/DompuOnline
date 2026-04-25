import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { error, count } = await supabase
      .from('jobs')
      .delete({ count: 'exact' })
      .lt('expiry_date', now)

    if (error) throw error

    return NextResponse.json({ success: true, deletedCount: count || 0 })
  } catch (error: any) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
