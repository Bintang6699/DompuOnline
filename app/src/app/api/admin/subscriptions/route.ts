import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/subscriptions — fetch all subscriptions (bypasses RLS)
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, vendors(id, name, owner_name, phone, status, categories(name))')
      .order('end_date', { ascending: true })

    if (error) throw error

    return NextResponse.json({ subscriptions: data || [] })
  } catch (error: any) {
    console.error('GET /api/admin/subscriptions error:', error)
    return NextResponse.json({ error: error.message, subscriptions: [] }, { status: 500 })
  }
}

// PATCH /api/admin/subscriptions — update subscription status/plan
export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, vendor_id, updates, vendorUpdates } = body

    if (!id || !vendor_id) {
      return NextResponse.json({ error: 'ID and vendor_id are required' }, { status: 400 })
    }

    if (updates) {
      const { error } = await supabase.from('subscriptions').update(updates).eq('id', id)
      if (error) throw error
    }

    if (vendorUpdates) {
      const { error: vError } = await supabase.from('vendors').update(vendorUpdates).eq('id', vendor_id)
      if (vError) throw vError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('PATCH /api/admin/subscriptions error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
