'use client'
import { useEffect, useState } from 'react'
import {
  ShieldX, AlertTriangle, MessageCircle, Mail, RefreshCw,
  ChevronDown, ChevronUp, CheckCircle, Edit3, Phone, FileText,
  MapPin, User, Tag, Info,
} from 'lucide-react'

interface SpamDetectedScreenProps {
  blockReasons?: string[]
  similarVendors?: { name: string; matches: string[] }[]
  securityFlag?: string | null
  adminWhatsapp?: string
  adminEmail?: string
  onRetry?: () => void
}

// Maps raw block reason text → field-specific guidance
interface FieldGuidance {
  icon: React.ReactNode
  field: string
  problem: string
  solution: string
  severity: 'high' | 'medium' | 'low'
}

function parseGuidance(reasons: string[], similarVendors: { name: string; matches: string[] }[]): FieldGuidance[] {
  const guidance: FieldGuidance[] = []

  for (const reason of reasons) {
    const r = reason.toLowerCase()

    if (r.includes('whatsapp') || r.includes('nomor') || r.includes('phone')) {
      guidance.push({
        icon: <Phone size={15} />,
        field: 'Nomor WhatsApp',
        problem: 'Nomor WhatsApp yang kamu masukkan sudah terdaftar di sistem kami.',
        solution: 'Gunakan nomor WhatsApp yang berbeda dan aktif. Setiap bisnis hanya boleh mendaftar dengan 1 nomor WA yang unik.',
        severity: 'high',
      })
    } else if (r.includes('nama usaha') || r.includes('nama') && r.includes('mirip')) {
      const pct = reason.match(/\d+%/)?.[0] || ''
      guidance.push({
        icon: <Tag size={15} />,
        field: 'Nama Usaha',
        problem: `Nama usaha yang kamu masukkan terlalu mirip dengan bisnis yang sudah ada${pct ? ` (kemiripan ${pct})` : ''}.`,
        solution: 'Gunakan nama usaha yang unik dan berbeda. Tambahkan nama kota, nama pemilik, atau kata khas bisnismu. Contoh: "Warung Siti Dompu" bukan hanya "Warung Siti".',
        severity: 'high',
      })
    } else if (r.includes('deskripsi') || r.includes('description')) {
      const pct = reason.match(/\d+%/)?.[0] || ''
      guidance.push({
        icon: <FileText size={15} />,
        field: 'Deskripsi Usaha',
        problem: `Deskripsi usahamu terlalu mirip dengan deskripsi bisnis lain yang sudah terdaftar${pct ? ` (kemiripan ${pct})` : ''}.`,
        solution: 'Tulis deskripsi dengan kata-katamu sendiri. Ceritakan keunikan bisnismu, produk andalan, jam operasional, atau keunggulan layananmu secara spesifik.',
        severity: 'high',
      })
    } else if (r.includes('alamat') || r.includes('address')) {
      guidance.push({
        icon: <MapPin size={15} />,
        field: 'Alamat Usaha',
        problem: 'Alamat yang kamu masukkan sangat mirip dengan bisnis lain yang sudah terdaftar.',
        solution: 'Pastikan alamat yang kamu masukkan adalah alamat tempat usahamu yang sesungguhnya. Tulis secara lengkap: nama jalan, nomor, RT/RW, kelurahan.',
        severity: 'medium',
      })
    } else if (r.includes('ip') && (r.includes('sama') || r.includes('banyak') || r.includes('kali'))) {
      guidance.push({
        icon: <Info size={15} />,
        field: 'Batas Pendaftaran',
        problem: 'Terlalu banyak percobaan pendaftaran terdeteksi dari jaringan/perangkat yang sama dalam waktu singkat.',
        solution: 'Tunggu beberapa saat sebelum mencoba lagi, atau hubungi admin untuk mendaftarkan bisnismu secara manual.',
        severity: 'medium',
      })
    } else if (r.includes('perangkat') || r.includes('fingerprint')) {
      guidance.push({
        icon: <Info size={15} />,
        field: 'Perangkat',
        problem: 'Perangkat ini terdeteksi telah digunakan untuk mendaftar terlalu banyak akun.',
        solution: 'Hubungi admin untuk melakukan tinjauan manual pendaftaranmu.',
        severity: 'medium',
      })
    } else if (r.includes('diblokir') || r.includes('blokir')) {
      guidance.push({
        icon: <ShieldX size={15} />,
        field: 'Akses Diblokir',
        problem: 'IP address atau perangkat kamu telah diblokir oleh sistem keamanan.',
        solution: 'Hubungi admin secara langsung via WhatsApp atau email untuk meminta tinjauan manual.',
        severity: 'high',
      })
    } else {
      // Fallback for any unrecognized reason
      guidance.push({
        icon: <AlertTriangle size={15} />,
        field: 'Deteksi Keamanan',
        problem: reason,
        solution: 'Periksa kembali data yang kamu masukkan dan pastikan semua informasi adalah asli dan unik.',
        severity: 'low',
      })
    }
  }

  // If similar vendors matched certain fields, add field-specific guidance
  for (const v of similarVendors) {
    for (const match of v.matches) {
      const m = match.toLowerCase()
      if (m.includes('nama') && !guidance.some(g => g.field === 'Nama Usaha')) {
        guidance.push({
          icon: <Tag size={15} />,
          field: 'Nama Usaha',
          problem: `Nama usahamu mirip dengan "${v.name}" yang sudah terdaftar.`,
          solution: 'Ubah nama usaha agar lebih unik. Tambahkan kata khas atau lokasi spesifik.',
          severity: 'high',
        })
      } else if (m.includes('deskripsi') && !guidance.some(g => g.field === 'Deskripsi Usaha')) {
        guidance.push({
          icon: <FileText size={15} />,
          field: 'Deskripsi Usaha',
          problem: `Deskripsi usahamu terlalu mirip dengan bisnis "${v.name}" yang sudah ada.`,
          solution: 'Tulis ulang deskripsi dengan bahasa dan informasi yang benar-benar milikmu sendiri.',
          severity: 'high',
        })
      } else if (m.includes('alamat') && !guidance.some(g => g.field === 'Alamat Usaha')) {
        guidance.push({
          icon: <MapPin size={15} />,
          field: 'Alamat Usaha',
          problem: `Alamat yang kamu masukkan mirip dengan "${v.name}".`,
          solution: 'Pastikan alamat yang kamu tulis benar-benar lokasi bisnismu.',
          severity: 'medium',
        })
      }
    }
  }

  return guidance
}

const SEVERITY_CONFIG = {
  high: {
    bg: '#fff1f2',
    border: '#fecdd3',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    labelBg: '#fef2f2',
    labelColor: '#dc2626',
    labelText: 'Wajib Diperbaiki',
    dot: '#dc2626',
  },
  medium: {
    bg: '#fffbeb',
    border: '#fde68a',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    labelBg: '#fef9c3',
    labelColor: '#b45309',
    labelText: 'Perlu Diperhatikan',
    dot: '#f59e0b',
  },
  low: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    labelBg: '#f0fdf4',
    labelColor: '#15803d',
    labelText: 'Info',
    dot: '#22c55e',
  },
}

const FLAG_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  spam:      { label: 'Potensi Spam',         color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  duplicate: { label: 'Duplikat Terdeteksi',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  high_risk: { label: 'Risiko Tinggi',        color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  copyright: { label: 'Hak Cipta Terdeteksi', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  blocked:   { label: 'Diblokir Sistem',      color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

export function SpamDetectedScreen({
  blockReasons = [],
  similarVendors = [],
  securityFlag,
  adminWhatsapp,
  adminEmail,
  onRetry,
}: SpamDetectedScreenProps) {
  const [visible, setVisible] = useState(false)
  const [showSimilar, setShowSimilar] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 80)
  }, [])

  const flag = securityFlag && FLAG_CONFIG[securityFlag] ? FLAG_CONFIG[securityFlag] : FLAG_CONFIG.spam
  const guidance = parseGuidance(blockReasons, similarVendors)
  const highCount = guidance.filter(g => g.severity === 'high').length

  const handleWhatsApp = () => {
    if (!adminWhatsapp) return
    const wa = adminWhatsapp.replace(/\D/g, '')
    const problems = guidance.map(g => `- ${g.field}: ${g.problem}`).join('\n')
    const msg = encodeURIComponent(
      `Halo Admin Dompu Online,\n\nSaya ingin meminta tinjauan manual atas pendaftaran saya yang ditolak sistem keamanan.\n\nMasalah terdeteksi:\n${problems}\n\nMohon bantuannya. Terima kasih.`
    )
    window.open(`https://wa.me/${wa}?text=${msg}`, '_blank')
  }

  const handleEmail = () => {
    if (!adminEmail) return
    const problems = guidance.map(g => `- ${g.field}: ${g.problem}`).join('%0D%0A')
    window.open(
      `mailto:${adminEmail}?subject=Permintaan Tinjauan Manual Pendaftaran&body=Halo Admin,%0D%0A%0D%0ASaya ingin meminta tinjauan manual atas pendaftaran saya yang ditolak sistem keamanan Dompu Online.%0D%0A%0D%0AMasalah terdeteksi:%0D%0A${problems}%0D%0A%0D%0ATerima kasih.`,
      '_blank'
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f7ff',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '24px 16px 48px',
      overflowY: 'auto',
    }}>
      {/* Soft blobs */}
      <div style={{
        position: 'fixed', top: '-5%', right: '-5%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{
        maxWidth: 460, width: '100%', position: 'relative', zIndex: 1,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* ── Header Card ── */}
        <div style={{
          background: '#fff', borderRadius: 24,
          border: `1px solid ${flag.border}`,
          padding: '28px 24px 20px',
          marginBottom: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: flag.bg, border: `2px solid ${flag.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <ShieldX size={38} color={flag.color} strokeWidth={1.5} />
          </div>

          {/* Flag badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 99,
            background: flag.bg, border: `1px solid ${flag.border}`,
            marginBottom: 12,
          }}>
            <AlertTriangle size={10} color={flag.color} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: flag.color, textTransform: 'uppercase' }}>
              {flag.label}
            </span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 8px', lineHeight: 1.3 }}>
            Pendaftaran Ditolak
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
            Sistem keamanan Dompu Online mendeteksi {highCount > 0 ? `${highCount} masalah penting` : 'beberapa masalah'} pada data yang kamu masukkan. Periksa detail di bawah untuk memperbaikinya.
          </p>
        </div>

        {/* ── Field-by-Field Guidance ── */}
        {guidance.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 20,
            border: '1px solid #e5e7eb',
            padding: '20px',
            marginBottom: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Edit3 size={15} color="#7c3aed" />
              <p style={{ fontSize: 12, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: 0.3 }}>
                Yang Perlu Kamu Perbaiki
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {guidance.map((g, i) => {
                const sc = SEVERITY_CONFIG[g.severity]
                return (
                  <div key={i} style={{
                    borderRadius: 14,
                    background: sc.bg,
                    border: `1px solid ${sc.border}`,
                    overflow: 'hidden',
                  }}>
                    {/* Field header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px 8px',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: sc.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, color: sc.iconColor,
                      }}>
                        {g.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.2 }}>
                          {g.field}
                        </p>
                      </div>
                      <span style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
                        padding: '2px 8px', borderRadius: 99,
                        background: sc.labelBg, color: sc.labelColor,
                        textTransform: 'uppercase',
                      }}>
                        {g.labelText}
                      </span>
                    </div>

                    {/* Problem */}
                    <div style={{ padding: '0 14px 6px' }}>
                      <p style={{
                        fontSize: 12, color: '#374151',
                        lineHeight: 1.6, margin: '0 0 6px',
                        paddingLeft: 36,
                      }}>
                        ⚠️ <strong>Masalah:</strong> {g.problem}
                      </p>

                      {/* Solution */}
                      <div style={{
                        background: 'rgba(255,255,255,0.7)', borderRadius: 10,
                        padding: '8px 12px', marginLeft: 36,
                        borderLeft: `3px solid ${sc.dot}`,
                      }}>
                        <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, margin: 0 }}>
                          <span style={{ fontWeight: 700, color: '#111827' }}>✏️ Solusi: </span>
                          {g.solution}
                        </p>
                      </div>
                    </div>
                    <div style={{ height: 8 }} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Similar Vendors (collapsible) ── */}
        {similarVendors.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 16,
            border: '1px solid #e5e7eb',
            marginBottom: 16, overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <button
              onClick={() => setShowSimilar(!showSimilar)}
              style={{
                width: '100%', padding: '14px 18px',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
                  Kemiripan dengan Bisnis yang Sudah Terdaftar
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: '#9333ea',
                  background: '#f5f3ff', padding: '2px 8px', borderRadius: 99,
                }}>
                  {similarVendors.length} bisnis
                </span>
                {showSimilar ? <ChevronUp size={15} color="#9333ea" /> : <ChevronDown size={15} color="#9333ea" />}
              </div>
            </button>

            {showSimilar && (
              <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {similarVendors.map((v, i) => (
                  <div key={i} style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: '#fafafa', border: '1px solid #e5e7eb',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, background: '#f5f3ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Tag size={13} color="#7c3aed" />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>
                        {v.name}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 36 }}>
                      {v.matches.map((m, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: '#f59e0b', fontSize: 12, lineHeight: 1.3, flexShrink: 0 }}>›</span>
                          <p style={{ fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{m}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Action tip ── */}
        <div style={{
          background: '#fffbeb', borderRadius: 14,
          border: '1px solid #fde68a', padding: '12px 16px',
          marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <CheckCircle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6, margin: 0 }}>
            <strong>Cara terbaik:</strong> Klik <em>"Coba Daftar Ulang"</em> di bawah, lalu perbaiki data sesuai panduan di atas. Jika masih bermasalah, hubungi admin untuk tinjauan manual.
          </p>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 24px', borderRadius: 14,
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(124,58,237,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.4)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)' }}
            >
              <RefreshCw size={16} />
              Coba Daftar Ulang (Perbaiki Data)
            </button>
          )}

          {adminWhatsapp && (
            <button
              onClick={handleWhatsApp}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px 24px', borderRadius: 14,
                background: 'linear-gradient(135deg, #15803d, #16a34a)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(22,163,74,0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <MessageCircle size={16} />
              Hubungi Admin via WhatsApp
            </button>
          )}

          {adminEmail && (
            <button
              onClick={handleEmail}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px 24px', borderRadius: 14,
                background: '#fff', border: '1px solid #e5e7eb',
                color: '#374151', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}
            >
              <Mail size={16} />
              Kirim Email untuk Tinjauan Manual
            </button>
          )}
        </div>

        {/* Footer note */}
        <p style={{
          fontSize: 11, textAlign: 'center', color: '#9ca3af',
          lineHeight: 1.6, marginTop: 20,
        }}>
          Sistem keamanan Dompu Online dirancang untuk melindungi semua mitra yang terdaftar.<br />
          Jika ini adalah kesalahan, admin akan meninjaunya dalam 1–2 hari kerja.
        </p>
      </div>
    </div>
  )
}
