import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/vendors/[id] — fetch single vendor with all related data (bypasses RLS)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { id } = await params

    const { data, error } = await supabase
      .from('vendors')
      .select(`
        *, categories(id, name, icon, slug),
        media(id, type, url),
        ratings(id, quality_score, cleanliness_score, trust_score, notes),
        products(id, name, price, description, image_url, livestock_details),
        services(id, title, price, description),
        jobs(id, title, description, requirements, location, type),
        subscriptions(id, plan, status, start_date, end_date, amount_paid)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Vendor tidak ditemukan' }, { status: 404 })

    return NextResponse.json({ vendor: data })
  } catch (error: any) {
    console.error('GET /api/admin/vendors/[id] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/admin/vendors/[id] — update vendor info
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { id } = await params
    const body = await request.json()

    const { error } = await supabase.from('vendors').update(body).eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('PATCH /api/admin/vendors/[id] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/vendors/[id] — delete vendor
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { id } = await params

    const { error } = await supabase.from('vendors').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/admin/vendors/[id] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
