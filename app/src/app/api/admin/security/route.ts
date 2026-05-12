import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// GET /api/admin/security?type=logs|blocked|suspicious
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'suspicious'
  const supabase = createAdminClient()

  try {
    if (type === 'logs') {
      const { data } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      return NextResponse.json({ logs: data || [] })
    }

    if (type === 'blocked') {
      const { data } = await supabase
        .from('blocked_identities')
        .select('*')
        .order('created_at', { ascending: false })
      return NextResponse.json({ blocked: data || [] })
    }

    // suspicious vendors
    const { data } = await supabase
      .from('vendors')
      .select('id, name, owner_name, phone, status, spam_score, duplicate_score, security_flag, blocked_reason, ip_address, fingerprint_id, created_at, categories(name, icon)')
      .or('security_flag.not.is.null,spam_score.gt.30,duplicate_score.gt.30')
      .order('created_at', { ascending: false })
      .limit(100)

    return NextResponse.json({ vendors: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/admin/security — block IP or fingerprint
export async function POST(request: Request) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { type, value, reason } = body

  if (!type || !value) {
    return NextResponse.json({ error: 'Missing type or value' }, { status: 400 })
  }

  try {
    const { error } = await supabase.from('blocked_identities').upsert(
      { type, value, reason: reason || 'Blocked by admin', blocked_by: 'admin' },
      { onConflict: 'value' }
    )
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/admin/security — unblock
export async function DELETE(request: Request) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    const { error } = await supabase.from('blocked_identities').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/admin/security — update vendor security flag
export async function PATCH(request: Request) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { vendor_id, action } = body

  if (!vendor_id || !action) {
    return NextResponse.json({ error: 'Missing vendor_id or action' }, { status: 400 })
  }

  try {
    let updateData: Record<string, any> = {}

    switch (action) {
      case 'mark_spam':
        updateData = { security_flag: 'spam', status: 'rejected', blocked_reason: 'Ditandai spam oleh admin' }
        break
      case 'clear_flag':
        updateData = { security_flag: null, blocked_reason: null }
        break
      case 'approve':
        updateData = { status: 'approved', security_flag: null }
        break
      case 'reject':
        updateData = { status: 'rejected' }
        break
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const { error } = await supabase.from('vendors').update(updateData).eq('id', vendor_id)
    if (error) throw error

    await supabase.from('security_logs').insert({
      vendor_id,
      event_type: `admin_${action}`,
      details: { action },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
