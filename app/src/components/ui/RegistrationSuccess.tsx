'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, Shield, Sparkles, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const NEXT_STEPS = [
  'Admin akan meninjau data usahamu dengan seksama',
  'Tim survei akan mengunjungi lokasi usahamu',
  'Setelah disetujui, usahamu akan tampil di DompuOnline',
]

export function RegistrationSuccess() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    setTimeout(() => setVisible(true), 80)
    setTimeout(() => setStep(1), 500)
    setTimeout(() => setStep(2), 800)
    setTimeout(() => setStep(3), 1100)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f7ff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'fixed', top: '-10%', right: '-10%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', left: '-10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,51,234,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 420, width: '100%', position: 'relative', zIndex: 1,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Icon section */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: '#f0fdf4',
            border: '2px solid #bbf7d0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 0 8px rgba(34,197,94,0.06), 0 8px 32px rgba(34,197,94,0.15)',
            animation: 'successPulse 2.5s ease-in-out infinite',
          }}>
            <CheckCircle size={48} color="#16a34a" strokeWidth={1.5} />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 14px', borderRadius: 99,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            marginBottom: 14,
          }}>
            <Shield size={11} color="#16a34a" />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#15803d', textTransform: 'uppercase' }}>
              Terverifikasi Aman
            </span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', margin: '0 0 10px', lineHeight: 1.2 }}>
            Pendaftaran Berhasil! 🎉
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
            Data usahamu telah melewati pemeriksaan sistem keamanan Dompu Online.
            Tim kami akan menghubungimu via WhatsApp dalam 1–2 hari kerja.
          </p>
        </div>

        {/* Steps card */}
        <div style={{
          background: '#fff', borderRadius: 20,
          border: '1px solid #e5e7eb',
          padding: 20, marginBottom: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Sparkles size={15} color="#7c3aed" />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#374151', letterSpacing: 0.3 }}>
              LANGKAH SELANJUTNYA
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {NEXT_STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                opacity: step > i ? 1 : 0,
                transform: step > i ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'all 0.4s ease',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, margin: 0, paddingTop: 4 }}>
                  {s}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          padding: '12px 16px',
          borderRadius: 14, background: '#f0fdf4', border: '1px solid #bbf7d0',
          marginBottom: 20,
        }}>
          <Shield size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: '#15803d', margin: 0, lineHeight: 1.5 }}>
            Data yang kamu kirim telah dienkripsi dan disimpan aman oleh sistem keamanan Dompu Online.
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%', padding: '14px 24px', borderRadius: 14,
            background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
            border: 'none', color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(124,58,237,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.3)' }}
        >
          Kembali ke Beranda <ArrowRight size={16} />
        </button>
      </div>

      <style>{`
        @keyframes successPulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(34,197,94,0.06), 0 8px 32px rgba(34,197,94,0.15); }
          50% { box-shadow: 0 0 0 14px rgba(34,197,94,0.04), 0 8px 40px rgba(34,197,94,0.22); }
        }
      `}</style>
    </div>
  )
}
