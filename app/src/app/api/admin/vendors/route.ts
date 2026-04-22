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
    const { id, status, activateSubscription, plan: requestedPlan } = body

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    // Helper function to calculate expiration date (Overwrite logic)
    const calculateEndDate = (plan: string, fromDate: Date) => {
      const end = new Date(fromDate)
      if (plan === 'free_1_month' || plan === '1_month') end.setMonth(end.getMonth() + 1)
      else if (plan === 'free_2_month') end.setMonth(end.getMonth() + 2)
      else if (plan === '3_month') end.setMonth(end.getMonth() + 3)
      else if (plan === '6_month') end.setMonth(end.getMonth() + 6)
      else if (plan === '1_year') end.setFullYear(end.getFullYear() + 1)
      else end.setMonth(end.getMonth() + 1)
      return end
    }

    // Manual activation or automatic activation upon approval
    if (activateSubscription || status === 'approved') {
      // Get existing subscription to know the plan if not provided
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('vendor_id', id)
        .maybeSingle()

      const plan = requestedPlan || subData?.plan || '1_month'
      const now = new Date()
      const expiryDate = calculateEndDate(plan, now)

      // Update Vendor
      const { error: vError } = await supabase
        .from('vendors')
        .update({
          status: status || 'approved',
          subscription_status: 'active',
          subscription_start: now.toISOString(),
          subscription_end: expiryDate.toISOString(),
        })
        .eq('id', id)

      if (vError) throw vError

      // Update/Upsert Subscription record
      const { error: sError } = await supabase
        .from('subscriptions')
        .upsert({
          vendor_id: id,
          plan,
          status: 'active',
          start_date: now.toISOString(),
          end_date: expiryDate.toISOString(),
        }, { onConflict: 'vendor_id' })

      if (sError) console.error('Subscription update error:', sError)

      return NextResponse.json({
        success: true,
        action: status === 'approved' ? 'approved_and_activated' : 'activated'
      })
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
