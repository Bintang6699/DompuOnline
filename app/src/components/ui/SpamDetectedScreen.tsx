'use client'
import { useEffect, useState } from 'react'
import { ShieldX, AlertTriangle, MessageCircle, Mail, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

interface SpamDetectedScreenProps {
  blockReasons?: string[]
  similarVendors?: { name: string; matches: string[] }[]
  securityFlag?: string | null
  adminWhatsapp?: string
  adminEmail?: string
  onRetry?: () => void
}

const FLAG_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  spam: {
    label: 'Potensi Spam',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.3)',
  },
  duplicate: {
    label: 'Duplikat Terdeteksi',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
  },
  high_risk: {
    label: 'Risiko Tinggi',
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.12)',
    border: 'rgba(220,38,38,0.3)',
  },
  copyright: {
    label: 'Hak Cipta Terdeteksi',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.3)',
  },
  blocked: {
    label: 'Diblokir Sistem',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
  },
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
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const flag = securityFlag && FLAG_CONFIG[securityFlag] ? FLAG_CONFIG[securityFlag] : FLAG_CONFIG.spam

  const handleWhatsApp = () => {
    if (!adminWhatsapp) return
    const wa = adminWhatsapp.replace(/\D/g, '')
    const msg = encodeURIComponent(
      `Halo Admin Dompu Online,\n\nSaya ingin meminta tinjauan manual atas pendaftaran saya yang ditolak oleh sistem keamanan.\n\nMohon bantuannya. Terima kasih.`
    )
    window.open(`https://wa.me/${wa}?text=${msg}`, '_blank')
  }

  const handleEmail = () => {
    if (!adminEmail) return
    window.open(
      `mailto:${adminEmail}?subject=Permintaan Tinjauan Manual Pendaftaran&body=Halo Admin,%0D%0A%0D%0ASaya ingin meminta tinjauan manual atas pendaftaran saya yang ditolak sistem keamanan Dompu Online.%0D%0A%0D%0ATerima kasih.`,
      '_blank'
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #1a0020 0%, #0a0010 40%, #050008 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%', width: 350, height: 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 440, width: '100%',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Icon + Badge */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 96, height: 96,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${flag.bg} 0%, transparent 70%)`,
            border: `2px solid ${flag.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: `0 0 60px ${flag.bg}`,
          }}>
            <ShieldX size={44} color={flag.color} strokeWidth={1.5} />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 14px', borderRadius: 99,
            background: flag.bg,
            border: `1px solid ${flag.border}`,
            marginBottom: 14,
          }}>
            <AlertTriangle size={11} color={flag.color} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: flag.color, textTransform: 'uppercase' }}>
              {flag.label}
            </span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>
            Pendaftaran Ditolak
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(200,200,220,0.7)', lineHeight: 1.7, margin: 0 }}>
            Sistem keamanan Dompu Online mendeteksi potensi masalah pada pendaftaranmu.
          </p>
        </div>

        {/* Detection results */}
        {blockReasons.length > 0 && (
          <div style={{
            borderRadius: 18,
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239,68,68,0.2)',
            padding: 20,
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: flag.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
              🔍 Masalah yang Terdeteksi:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {blockReasons.map((reason, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.12)',
                }}>
                  <span style={{ color: '#ef4444', fontSize: 14, lineHeight: 1.2, flexShrink: 0 }}>•</span>
                  <p style={{ fontSize: 12, color: 'rgba(255,200,200,0.85)', margin: 0, lineHeight: 1.5 }}>{reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar vendors (collapsible) */}
        {similarVendors.length > 0 && (
          <div style={{
            borderRadius: 18,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(147,51,234,0.2)',
            marginBottom: 16,
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                width: '100%', padding: '14px 20px',
                background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(200,150,255,0.9)', letterSpacing: 1, textTransform: 'uppercase' }}>
                Kemiripan dengan Usaha Lain
              </span>
              {showDetails ? <ChevronUp size={16} color="#a855f7" /> : <ChevronDown size={16} color="#a855f7" />}
            </button>
            {showDetails && (
              <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {similarVendors.map((v, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(147,51,234,0.06)',
                    border: '1px solid rgba(147,51,234,0.15)',
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(220,180,255,0.9)', marginBottom: 6 }}>
                      {v.name}
                    </p>
                    {v.matches.map((m, j) => (
                      <div key={j} style={{
                        fontSize: 11, color: 'rgba(180,150,220,0.75)',
                        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3,
                      }}>
                        <span style={{ color: '#a855f7' }}>›</span> {m}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {adminWhatsapp && (
            <button
              onClick={handleWhatsApp}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '13px 24px', borderRadius: 14,
                background: 'linear-gradient(135deg, #15803d, #16a34a)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(22,163,74,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <MessageCircle size={18} />
              Hubungi Admin via WhatsApp
            </button>
          )}
          {adminEmail && (
            <button
              onClick={handleEmail}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '13px 24px', borderRadius: 14,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(220,220,240,0.85)', fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <Mail size={18} />
              Kirim Email untuk Tinjauan Manual
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 24px', borderRadius: 14,
                background: 'none',
                border: '1px solid rgba(147,51,234,0.25)',
                color: 'rgba(200,150,255,0.7)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(147,51,234,0.5)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(147,51,234,0.25)'}
            >
              <RefreshCw size={15} />
              Coba Daftar Ulang
            </button>
          )}
        </div>

        {/* Info note */}
        <p style={{
          fontSize: 11, textAlign: 'center',
          color: 'rgba(200,200,220,0.4)', lineHeight: 1.6,
        }}>
          Jika kamu merasa ini adalah kesalahan, hubungi admin untuk tinjauan manual.
          Data akan diperiksa dalam 1–2 hari kerja.
        </p>
      </div>
    </div>
  )
}
