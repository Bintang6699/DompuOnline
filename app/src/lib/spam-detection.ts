/**
 * Spam & Duplicate Detection Engine
 * Uses similarity scoring to detect duplicate/spam registrations
 */

export interface SpamCheckInput {
  name: string
  phone: string
  description: string
  address_detail?: string
  owner_name?: string
  ip_address?: string
  fingerprint_id?: string
}

export interface SimilarityResult {
  vendor_id: string
  vendor_name: string
  matches: SimilarityMatch[]
  total_score: number
}

export interface SimilarityMatch {
  field: string
  score: number
  label: string
}

export interface SpamCheckResult {
  is_spam: boolean
  spam_score: number
  duplicate_score: number
  blocked_reason: string | null
  security_flag: string | null
  similar_vendors: SimilarityResult[]
  block_reasons: string[]
}

// Levenshtein distance algorithm
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  return dp[m][n]
}

// String similarity score (0–1, 1 = identical)
export function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  const _a = a.toLowerCase().trim()
  const _b = b.toLowerCase().trim()
  if (_a === _b) return 1
  const maxLen = Math.max(_a.length, _b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(_a, _b) / maxLen
}

// Normalize phone number (remove spaces, dashes, leading zeros)
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().+]/g, '').replace(/^0+/, '62')
}

// Weights for each similarity type
const WEIGHTS = {
  phone_exact: 100,
  name_similar: 40,
  description_similar: 30,
  address_similar: 20,
  ip_rate_limit: 25,
  fingerprint_rate_limit: 30,
  blocked_ip: 100,
  blocked_fingerprint: 100,
}

// Thresholds for triggering similarity detection
const THRESHOLDS = {
  name: 0.70,
  description: 0.60,
  address: 0.65,
}

export function calculateSimilarityScore(
  input: SpamCheckInput,
  existing: SpamCheckInput & { id: string; name_check: string }
): SimilarityResult {
  const matches: SimilarityMatch[] = []
  let total = 0

  // Phone check (exact match after normalization)
  const normalizedInput = normalizePhone(input.phone)
  const normalizedExisting = normalizePhone(existing.phone)
  if (normalizedInput === normalizedExisting) {
    const score = WEIGHTS.phone_exact
    total += score
    matches.push({ field: 'phone', score, label: 'Nomor WhatsApp identik' })
  }

  // Name similarity
  const nameSim = stringSimilarity(input.name, existing.name)
  if (nameSim >= THRESHOLDS.name) {
    const score = Math.round(nameSim * WEIGHTS.name_similar)
    total += score
    matches.push({ field: 'name', score, label: `Nama usaha mirip (${Math.round(nameSim * 100)}%)` })
  }

  // Description similarity
  const descSim = stringSimilarity(input.description, existing.description)
  if (descSim >= THRESHOLDS.description) {
    const score = Math.round(descSim * WEIGHTS.description_similar)
    total += score
    matches.push({ field: 'description', score, label: `Deskripsi mirip (${Math.round(descSim * 100)}%)` })
  }

  // Address similarity
  if (input.address_detail && existing.address_detail) {
    const addrSim = stringSimilarity(input.address_detail, existing.address_detail)
    if (addrSim >= THRESHOLDS.address) {
      const score = Math.round(addrSim * WEIGHTS.address_similar)
      total += score
      matches.push({ field: 'address', score, label: `Alamat mirip (${Math.round(addrSim * 100)}%)` })
    }
  }

  return {
    vendor_id: existing.id,
    vendor_name: existing.name,
    matches,
    total_score: total,
  }
}

export function buildSpamResult(
  results: SimilarityResult[],
  ipCount: number,
  fpCount: number,
  isBlockedIp: boolean,
  isBlockedFp: boolean
): SpamCheckResult {
  const SPAM_THRESHOLD = 60

  const block_reasons: string[] = []
  let spam_score = 0
  let duplicate_score = 0
  let security_flag: string | null = null
  let blocked_reason: string | null = null

  // Hard blocks
  if (isBlockedIp) {
    spam_score += WEIGHTS.blocked_ip
    block_reasons.push('IP address Anda telah diblokir oleh sistem')
  }
  if (isBlockedFp) {
    spam_score += WEIGHTS.blocked_fingerprint
    block_reasons.push('Perangkat Anda telah diblokir oleh sistem')
  }

  // IP rate limiting
  if (ipCount >= 3) {
    spam_score += WEIGHTS.ip_rate_limit
    block_reasons.push(`Terlalu banyak pendaftaran dari IP yang sama (${ipCount} kali)`)
  }
  if (fpCount >= 3) {
    spam_score += WEIGHTS.fingerprint_rate_limit
    block_reasons.push(`Terlalu banyak pendaftaran dari perangkat yang sama (${fpCount} kali)`)
  }

  // Similarity from existing vendors
  const high_similarity = results.filter(r => r.total_score > 0)
  for (const r of high_similarity) {
    duplicate_score = Math.max(duplicate_score, r.total_score)
    for (const m of r.matches) {
      if (!block_reasons.some(b => b.includes(m.label))) {
        block_reasons.push(m.label)
      }
    }
  }

  const total_score = spam_score + duplicate_score

  if (isBlockedIp || isBlockedFp) {
    security_flag = 'blocked'
    blocked_reason = 'IP atau perangkat diblokir'
  } else if (total_score >= SPAM_THRESHOLD) {
    if (duplicate_score >= 60) {
      security_flag = 'duplicate'
      blocked_reason = 'Duplikat terdeteksi'
    } else {
      security_flag = 'spam'
      blocked_reason = 'Spam terdeteksi'
    }
    if (spam_score >= 25 && duplicate_score >= 30) {
      security_flag = 'high_risk'
      blocked_reason = 'Risiko tinggi terdeteksi'
    }
  }

  return {
    is_spam: total_score >= SPAM_THRESHOLD || isBlockedIp || isBlockedFp,
    spam_score: Math.min(spam_score, 100),
    duplicate_score: Math.min(duplicate_score, 100),
    blocked_reason,
    security_flag,
    similar_vendors: high_similarity,
    block_reasons,
  }
}
