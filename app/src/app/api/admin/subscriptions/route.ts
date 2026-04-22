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
    const { id, vendor_id, updates, vendorUpdates, plan } = body

    if (!id || !vendor_id) {
      return NextResponse.json({ error: 'ID and vendor_id are required' }, { status: 400 })
    }

    let finalUpdates = updates || {}

    // If plan is provided, handle server-side expiry calculation (Overwrite logic)
    if (plan) {
      const now = new Date()
      const end = new Date(now)

      if (plan === 'free_1_month' || plan === '1_month') end.setMonth(end.getMonth() + 1)
      else if (plan === 'free_2_month') end.setMonth(end.getMonth() + 2)
      else if (plan === '3_month') end.setMonth(end.getMonth() + 3)
      else if (plan === '6_month') end.setMonth(end.getMonth() + 6)
      else if (plan === '1_year') end.setFullYear(end.getFullYear() + 1)
      else end.setMonth(end.getMonth() + 1)

      finalUpdates = {
        ...finalUpdates,
        plan,
        start_date: now.toISOString(),
        end_date: end.toISOString(),
        status: 'active'
      }

      // Sync with vendorUpdates if not provided
      if (!vendorUpdates) {
        await supabase.from('vendors').update({
          subscription_status: 'active',
          subscription_end: end.toISOString()
        }).eq('id', vendor_id)
      }
    }

    if (Object.keys(finalUpdates).length > 0) {
      const { error } = await supabase.from('subscriptions').update(finalUpdates).eq('id', id)
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
