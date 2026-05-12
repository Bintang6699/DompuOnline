import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getSubscriptionPrice } from '@/lib/utils'

function normalizePhone(phone: string): string {
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  }
  return cleaned
}

export async function POST(request: Request) {
  const supabase = createAdminClient()

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { formData } = body

  // ── Required fields ──
  if (!formData?.name || !formData?.phone || !formData?.description) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  try {
    // ── WhatsApp uniqueness check ──
    const normalizedInputPhone = normalizePhone(formData.phone)
    
    // Check if phone exists in DB
    const { data: existingVendors } = await supabase
      .from('vendors')
      .select('phone')
      
    const phoneMatch = (existingVendors || []).find(
      (v: any) => normalizePhone(v.phone) === normalizedInputPhone
    )

    if (phoneMatch) {
      return NextResponse.json(
        {
          error: 'phone_duplicate',
          message: 'Nomor WhatsApp ini sudah terdaftar di sistem kami.',
          spam_detected: true,
          block_reasons: ['Nomor WhatsApp ini sudah terdaftar'],
          similar_vendors: [],
          security_flag: 'duplicate'
        },
        { status: 409 }
      )
    }

    // ── Get category ID from slug ──
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', formData.category_id)
      .single()

    const categoryId = catData?.id || null
    const vendorId = crypto.randomUUID()

    let finalDescription = formData.description
    if (formData.category_id === 'transport' && formData.vehicle_type) {
      const vType = formData.vehicle_type === 'mobil' ? '🚗 Mobil' : '🏍️ Motor'
      const vMerk = formData.transport_merk || '-'
      const vPlate = formData.transport_plate || '-'
      const vYear = formData.transport_year ? `(${formData.transport_year})` : ''
      const vArea = formData.service_area || '-'
      finalDescription = `📍 Area Operasi: ${vArea}\n${vType}: ${vMerk} ${vYear}\n🏁 Plat Nomor: ${vPlate}\n\n${formData.description}`
    }

    // ── Insert vendor ──
    const { error: vendorError } = await supabase.from('vendors').insert({
      id: vendorId,
      name: formData.name,
      owner_name: formData.owner_name,
      phone: formData.phone,
      category_id: categoryId,
      description: finalDescription,
      maps_link: formData.maps_link || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      address_detail: formData.address_detail || null,
      hashtags: formData.hashtags || [],
      is_cod: formData.is_cod || false,
      status: 'pending',
      subscription_status: 'pending',
    })

    if (vendorError) throw vendorError

    // ── Insert subscription ──
    await supabase.from('subscriptions').insert({
      vendor_id: vendorId,
      plan: formData.plan || '1_month',
      status: 'pending',
      amount_paid: getSubscriptionPrice(formData.plan || '1_month'),
    })

    return NextResponse.json({ success: true, vendor_id: vendorId })
  } catch (err: any) {
    console.error('Registration API error:', err)
    return NextResponse.json(
      { error: 'server_error', message: err?.message || 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
