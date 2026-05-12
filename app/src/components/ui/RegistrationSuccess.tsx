'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, Shield, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RegistrationSuccessProps {
  onBack?: () => void
}

const NEXT_STEPS = [
  'Admin akan meninjau data usahamu',
  'Tim survei akan mengunjungi lokasi',
  'Setelah disetujui, usahamu akan tampil di DompuOnline',
]

export function RegistrationSuccess({ onBack }: RegistrationSuccessProps) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    setTimeout(() => setShowSteps(true), 800)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #1a0533 0%, #0f0020 40%, #050008 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 420, width: '100%',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Success icon */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 100, height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 70%)',
            border: '2px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 60px rgba(34,197,94,0.25)',
            animation: 'successPulse 2s ease-in-out infinite',
          }}>
            <CheckCircle size={48} color="#22c55e" strokeWidth={1.5} />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 14px', borderRadius: 99,
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.25)',
            marginBottom: 16,
          }}>
            <Shield size={12} color="#4ade80" />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#4ade80', textTransform: 'uppercase' }}>
              Terverifikasi
            </span>
          </div>

          <h1 style={{
            fontSize: 28, fontWeight: 900, color: '#fff',
            margin: '0 0 10px', lineHeight: 1.2,
          }}>
            Pendaftaran Berhasil! 🎉
          </h1>
          <p style={{
            fontSize: 14, color: 'rgba(200,200,220,0.7)',
            lineHeight: 1.7, margin: 0,
          }}>
            Data usahamu telah berhasil melewati pemeriksaan sistem keamanan Dompu Online.
            Tim kami akan meninjau dalam 1–2 hari kerja.
          </p>
        </div>

        {/* Steps card */}
        <div style={{
          borderRadius: 20,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(147,51,234,0.2)',
          padding: '24px',
          marginBottom: 20,
          opacity: showSteps ? 1 : 0,
          transform: showSteps ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.6s ease 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Sparkles size={16} color="#a855f7" />
            <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(200,150,255,0.9)', letterSpacing: 0.5 }}>
              LANGKAH SELANJUTNYA
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {NEXT_STEPS.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                opacity: showSteps ? 1 : 0,
                transform: showSteps ? 'translateX(0)' : 'translateX(-8px)',
                transition: `all 0.5s ease ${0.3 + i * 0.15}s`,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 10px rgba(168,85,247,0.4)',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(220,220,240,0.85)', lineHeight: 1.5, margin: 0 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Security badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          borderRadius: 14,
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.15)',
          marginBottom: 24,
        }}>
          <Shield size={16} color="#22c55e" />
          <p style={{ fontSize: 11, color: 'rgba(134,239,172,0.8)', margin: 0, lineHeight: 1.4 }}>
            Data telah dienkripsi dan disimpan dengan aman oleh sistem keamanan Dompu Online.
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: 'none',
            color: '#fff',
            fontSize: 15, fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(168,85,247,0.35)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(168,85,247,0.45)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(168,85,247,0.35)'
          }}
        >
          Kembali ke Beranda
        </button>
      </div>

      <style>{`
        @keyframes successPulse {
          0%, 100% { box-shadow: 0 0 60px rgba(34,197,94,0.25); }
          50% { box-shadow: 0 0 80px rgba(34,197,94,0.4); }
        }
      `}</style>
    </div>
  )
}
