import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

function normalizePhone(phone: string): string {
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  }
  return cleaned
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')

  if (!phone || phone.trim().length < 8) {
    return NextResponse.json({ available: true })
  }

  try {
    const supabase = createAdminClient()
    const normalized = normalizePhone(phone)

    const { data } = await supabase
      .from('vendors')
      .select('phone')
      .limit(500)

    const exists = (data || []).some(
      (v: any) => normalizePhone(v.phone) === normalized
    )

    return NextResponse.json({ available: !exists, exists })
  } catch (err) {
    console.error('Check phone error:', err)
    return NextResponse.json({ available: true })
  }
}
