import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/sliders
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('sliders')
      .select('*, vendors(name, media(url, type)), news(title)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ sliders: data || [] })
  } catch (error: any) {
    console.error('GET /api/admin/sliders error:', error)
    return NextResponse.json({ error: error.message, sliders: [] }, { status: 500 })
  }
}

// POST /api/admin/sliders
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    
    const { data, error } = await supabase.from('sliders').insert({
      title: body.title,
      type: body.type,
      image_url: body.image_url,
      video_url: body.video_url,
      vendor_id: body.vendor_id || null,
      news_id: body.news_id || null,
      is_active: body.is_active ?? true,
    }).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('POST /api/admin/sliders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/admin/sliders
export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('sliders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('PATCH /api/admin/sliders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/sliders?id=xxx
export async function DELETE(request: Request) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const { error } = await supabase.from('sliders').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/admin/sliders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
