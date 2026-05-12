import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import {
  SpamCheckInput,
  calculateSimilarityScore,
  buildSpamResult,
  normalizePhone,
} from '@/lib/spam-detection'
import { getSettings } from '@/app/actions/settings'
import { getSubscriptionPrice } from '@/lib/utils'

// In-memory rate limit (per deployment instance, resets on restart)
// For production-grade, use Redis or Supabase-backed counters
const recentSubmissions = new Map<string, number[]>()
const WINDOW_MS = 60 * 60 * 1000 // 1 hour window
const MAX_PER_IP = 5

function getRecentCount(key: string): number {
  const now = Date.now()
  const timestamps = (recentSubmissions.get(key) || []).filter(
    (t) => now - t < WINDOW_MS
  )
  recentSubmissions.set(key, timestamps)
  return timestamps.length
}

function recordSubmission(key: string) {
  const timestamps = recentSubmissions.get(key) || []
  timestamps.push(Date.now())
  recentSubmissions.set(key, timestamps)
}

export async function POST(request: Request) {
  const supabase = createAdminClient()

  // ── Get IP ──
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

  // ── Parse body ──
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    formData,
    fingerprint_id,
    honeypot,
    // Media handled via separate upload – only metadata here
  } = body

  // ── Honeypot check ──
  if (honeypot && honeypot.trim() !== '') {
    // Silently reject bots without revealing detection
    return NextResponse.json(
      { success: true, vendor_id: 'bot-rejected', message: 'Pendaftaran berhasil dikirim.' },
      { status: 200 }
    )
  }

  // ── Required fields ──
  if (!formData?.name || !formData?.phone || !formData?.description) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  // ── Rate limit check (in-memory) ──
  const ipCount = getRecentCount(`ip:${ip}`)
  const fpCount = fingerprint_id ? getRecentCount(`fp:${fingerprint_id}`) : 0

  if (ipCount >= MAX_PER_IP) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: `Terlalu banyak permintaan dari IP Anda. Coba lagi dalam 1 jam.`,
        spam_detected: true,
        block_reasons: [`Terlalu banyak pendaftaran dari IP yang sama (${ipCount} kali)`],
      },
      { status: 429 }
    )
  }

  try {
    // ── Check blocked IPs / fingerprints ──
    const { data: blockedData } = await supabase
      .from('blocked_identities')
      .select('type, value')
      .in('value', [ip, fingerprint_id].filter(Boolean))

    const isBlockedIp = blockedData?.some((b: any) => b.type === 'ip' && b.value === ip) ?? false
    const isBlockedFp = fingerprint_id
      ? (blockedData?.some((b: any) => b.type === 'fingerprint' && b.value === fingerprint_id) ?? false)
      : false

    // ── Fetch recent vendors for similarity check (last 500) ──
    const { data: existingVendors } = await supabase
      .from('vendors')
      .select('id, name, phone, description, address_detail')
      .order('created_at', { ascending: false })
      .limit(500)

    const input: SpamCheckInput = {
      name: formData.name,
      phone: formData.phone,
      description: formData.description,
      address_detail: formData.address_detail,
      owner_name: formData.owner_name,
      ip_address: ip,
      fingerprint_id,
    }

    // ── WhatsApp uniqueness check ──
    const normalizedPhone = normalizePhone(formData.phone)
    const phoneMatch = (existingVendors || []).find(
      (v: any) => normalizePhone(v.phone) === normalizedPhone
    )
    if (phoneMatch) {
      return NextResponse.json(
        {
          error: 'phone_duplicate',
          message: 'Nomor WhatsApp ini sudah terdaftar di sistem kami.',
          spam_detected: true,
          block_reasons: ['Nomor WhatsApp ini sudah terdaftar'],
        },
        { status: 409 }
      )
    }

    // ── Similarity scoring ──
    const similarityResults = (existingVendors || []).map((v: any) =>
      calculateSimilarityScore(input, { ...v, name_check: v.name })
    ).filter((r: any) => r.total_score > 0)

    // ── Count registrations by same IP / fingerprint ──
    const { count: dbIpCount } = await supabase
      .from('vendors')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ip)

    const fpDbCount = fingerprint_id
      ? (await supabase
          .from('vendors')
          .select('id', { count: 'exact', head: true })
          .eq('fingerprint_id', fingerprint_id)
        ).count ?? 0
      : 0

    const totalIpCount = (dbIpCount ?? 0) + ipCount
    const totalFpCount = (fpDbCount as number) + fpCount

    // ── Build spam result ──
    const spamResult = buildSpamResult(
      similarityResults,
      totalIpCount,
      totalFpCount,
      isBlockedIp,
      isBlockedFp
    )

    // ── Log security event ──
    await supabase.from('security_logs').insert({
      event_type: spamResult.is_spam ? 'spam_detected' : 'registration_attempt',
      ip_address: ip,
      fingerprint_id,
      details: {
        name: formData.name,
        phone: formData.phone,
        spam_score: spamResult.spam_score,
        duplicate_score: spamResult.duplicate_score,
        block_reasons: spamResult.block_reasons,
        similar_vendors: spamResult.similar_vendors.slice(0, 3),
      },
    })

    // ── If spam detected, reject ──
    if (spamResult.is_spam) {
      recordSubmission(`ip:${ip}`)
      if (fingerprint_id) recordSubmission(`fp:${fingerprint_id}`)

      return NextResponse.json(
        {
          error: 'spam_detected',
          spam_detected: true,
          spam_score: spamResult.spam_score,
          duplicate_score: spamResult.duplicate_score,
          security_flag: spamResult.security_flag,
          block_reasons: spamResult.block_reasons,
          similar_vendors: spamResult.similar_vendors.slice(0, 3).map((v: any) => ({
            name: v.vendor_name,
            matches: v.matches.map((m: any) => m.label),
          })),
          message: 'Pendaftaran ditolak karena terdeteksi duplikat atau spam.',
        },
        { status: 422 }
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

    // ── Insert vendor with security metadata ──
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
      spam_score: spamResult.spam_score,
      duplicate_score: spamResult.duplicate_score,
      fingerprint_id: fingerprint_id || null,
      ip_address: ip,
      security_flag: spamResult.security_flag,
    })

    if (vendorError) throw vendorError

    // ── Insert subscription ──
    await supabase.from('subscriptions').insert({
      vendor_id: vendorId,
      plan: formData.plan || '1_month',
      status: 'pending',
      amount_paid: getSubscriptionPrice(formData.plan || '1_month'),
    })

    // ── Log similarity results ──
    if (spamResult.similar_vendors.length > 0) {
      const simLogs = spamResult.similar_vendors.flatMap((r: any) =>
        r.matches.map((m: any) => ({
          vendor_id: vendorId,
          matched_vendor_id: r.vendor_id,
          similarity_type: m.field,
          similarity_score: m.score,
        }))
      )
      await supabase.from('similarity_logs').insert(simLogs)
    }

    // ── Update security log with vendor_id ──
    await supabase.from('security_logs').insert({
      vendor_id: vendorId,
      event_type: 'registration_success',
      ip_address: ip,
      fingerprint_id,
      details: { name: formData.name, plan: formData.plan },
    })

    // Track rate limit
    recordSubmission(`ip:${ip}`)
    if (fingerprint_id) recordSubmission(`fp:${fingerprint_id}`)

    return NextResponse.json({ success: true, vendor_id: vendorId })
  } catch (err: any) {
    console.error('Registration API error:', err)
    return NextResponse.json(
      { error: 'server_error', message: err?.message || 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
