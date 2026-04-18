import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/news
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('news')
      .select('*, media(id, type, url)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ news: data || [] })
  } catch (error: any) {
    console.error('GET /api/admin/news error:', error)
    return NextResponse.json({ error: error.message, news: [] }, { status: 500 })
  }
}

// POST /api/admin/news
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { title, content, author, category, media } = body

    // 1. Insert News
    const { data: newsData, error: newsError } = await supabase
      .from('news')
      .insert({ title, content, author, category })
      .select()
      .single()

    if (newsError) throw newsError
    const newsId = newsData.id

    // 2. Insert Media if any
    if (media && media.length > 0) {
      const mediaToInsert = media.map((m: any) => ({
        news_id: newsId,
        type: m.type,
        url: m.url
      }))
      const { error: mediaError } = await supabase.from('media').insert(mediaToInsert)
      if (mediaError) throw mediaError
    }

    return NextResponse.json({ success: true, data: newsData })
  } catch (error: any) {
    console.error('POST /api/admin/news error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/admin/news
export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, title, content, author, category, media } = body

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    // 1. Update News
    const { error: newsError } = await supabase
      .from('news')
      .update({ title, content, author, category })
      .eq('id', id)

    if (newsError) throw newsError

    // 2. Handle Media
    // Simplest way: delete old media and insert new ones (as done in the original page.tsx)
    await supabase.from('media').delete().eq('news_id', id)

    if (media && media.length > 0) {
      const mediaToInsert = media.map((m: any) => ({
        news_id: id,
        type: m.type,
        url: m.url
      }))
      const { error: mediaError } = await supabase.from('media').insert(mediaToInsert)
      if (mediaError) throw mediaError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('PATCH /api/admin/news error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/news?id=xxx
export async function DELETE(request: Request) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    // Usually there is a foreign key constraint. If there's no ON DELETE CASCADE, 
    // we should delete media first.
    await supabase.from('media').delete().eq('news_id', id)
    
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/admin/news error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
