import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/vendors — fetch all vendors using service role (bypasses RLS)
// Returns ALL vendors including pending registrations
export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') || ''
    const categoryFilter = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''

    let query = supabase
      .from('vendors')
      .select('*, categories(name, icon, slug), media(url, type), ratings(quality_score, cleanliness_score, trust_score)')
      .order('created_at', { ascending: false })

    if (statusFilter) query = query.eq('status', statusFilter)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data, error } = await query

    if (error) throw error

    let vendors = data || []

    // Filter by category slug (client-side since join is nullable)
    if (categoryFilter) {
      vendors = vendors.filter((v: any) => v.categories?.slug === categoryFilter)
    }

    return NextResponse.json({ vendors })
  } catch (error: any) {
    console.error('GET /api/admin/vendors error:', error)
    return NextResponse.json({ error: error.message, vendors: [] }, { status: 500 })
  }
}

// PATCH /api/admin/vendors — update vendor status or activate subscription
export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, status, activateSubscription } = body

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    if (activateSubscription) {
      // Activate subscription for 1 month
      const plan = '1_month'
      const start = new Date()
      const end = new Date()
      end.setMonth(end.getMonth() + 1)

      const { error: vendorErr } = await supabase
        .from('vendors')
        .update({
          subscription_status: 'active',
          subscription_start: start.toISOString(),
          subscription_end: end.toISOString(),
        })
        .eq('id', id)

      if (vendorErr) throw vendorErr

      const { error: subErr } = await supabase
        .from('subscriptions')
        .upsert({
          vendor_id: id,
          plan,
          status: 'active',
          start_date: start.toISOString(),
          end_date: end.toISOString(),
        }, { onConflict: 'vendor_id' })

      if (subErr) console.error('Subscription upsert error:', subErr)

      return NextResponse.json({ success: true, action: 'subscription_activated' })
    }

    if (status) {
      const { error } = await supabase
        .from('vendors')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      return NextResponse.json({ success: true, action: 'status_updated', status })
    }

    return NextResponse.json({ error: 'Tidak ada aksi yang valid' }, { status: 400 })
  } catch (error: any) {
    console.error('PATCH /api/admin/vendors error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/vendors?id=xxx — hapus vendor
export async function DELETE(request: Request) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const { error } = await supabase.from('vendors').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/admin/vendors error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
