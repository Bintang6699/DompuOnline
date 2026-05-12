'use client'
import { useEffect, useState } from 'react'

const SCAN_MESSAGES = [
  'Menginisialisasi koneksi aman...',
  'Memverifikasi autentisitas data bisnis...',
  'Memeriksa nomor WhatsApp...',
  'Memvalidasi nomor dengan database...',
  'Memeriksa integritas informasi usaha...',
  'Memastikan data bebas duplikasi...',
  'Mengamankan proses pendaftaran...',
  'Verifikasi hampir selesai...',
]

interface SecurityLoadingScreenProps {
  onComplete?: () => void
  duration?: number
}

export function SecurityLoadingScreen({ onComplete, duration = 5000 }: SecurityLoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % SCAN_MESSAGES.length)
    }, duration / SCAN_MESSAGES.length)
    return () => clearInterval(interval)
  }, [duration])

  useEffect(() => {
    const start = Date.now()
    const frame = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / duration) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        requestAnimationFrame(tick)
      } else {
        onComplete?.()
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [duration, onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const chips = [
    { label: 'Enkripsi Aktif', done: progress > 15 },
    { label: 'Koneksi Aman', done: progress > 35 },
    { label: 'Verifikasi Data', done: progress > 55 },
    { label: 'Cek Duplikasi', done: progress > 75 },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#f8f7ff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        animation: 'gridMove 10s linear infinite',
      }} />

      {/* Soft purple glow blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Pulse rings */}
      <div style={{
        position: 'absolute', width: 340, height: 340, borderRadius: '50%',
        border: '1px solid rgba(147,51,234,0.12)',
        animation: 'pulse 3s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 460, height: 460, borderRadius: '50%',
        border: '1px solid rgba(147,51,234,0.06)',
        animation: 'pulse 3s ease-in-out infinite 0.6s',
      }} />

      {/* Main card */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '44px 36px 36px',
        maxWidth: 420, width: '90vw',
        borderRadius: 28,
        background: '#fff',
        border: '1px solid rgba(147,51,234,0.15)',
        boxShadow: '0 8px 48px rgba(147,51,234,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Eye Video */}
        <div style={{
          position: 'relative',
          width: 152, height: 152,
          borderRadius: '50%',
          overflow: 'hidden',
          marginBottom: 28,
          boxShadow: '0 0 0 6px rgba(147,51,234,0.08), 0 0 40px rgba(147,51,234,0.2)',
          border: '2px solid rgba(147,51,234,0.25)',
        }}>
          <video
            src="/animationLogo/eyes.mp4"
            autoPlay loop muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Scan line */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(transparent 35%, rgba(147,51,234,0.12) 50%, transparent 65%)',
            animation: 'scanLine 2.2s ease-in-out infinite',
          }} />
        </div>

        {/* Label */}
        <p style={{
          fontSize: 9, fontWeight: 800, letterSpacing: 3.5, textTransform: 'uppercase',
          color: '#9333ea', marginBottom: 8, textAlign: 'center',
        }}>
          DOMPU ONLINE SECURITY SYSTEM
        </p>
        <h2 style={{
          fontSize: 20, fontWeight: 800, color: '#1e1040',
          lineHeight: 1.3, margin: '0 0 20px', textAlign: 'center',
        }}>
          Memproses Data Anda
        </h2>

        {/* Scanning message box */}
        <div style={{
          width: '100%', marginBottom: 24,
          padding: '10px 14px', borderRadius: 12,
          background: 'rgba(147,51,234,0.05)',
          border: '1px solid rgba(147,51,234,0.12)',
          minHeight: 44,
        }}>
          <p style={{
            fontSize: 12, color: '#7c3aed', fontFamily: 'monospace',
            lineHeight: 1.5, margin: 0, textAlign: 'center',
          }}>
            <span style={{ marginRight: 6, opacity: 0.6 }}>›</span>
            {SCAN_MESSAGES[messageIndex]}{dots}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 9, color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>
              SECURITY SCAN
            </span>
            <span style={{ fontSize: 9, color: '#7c3aed', fontFamily: 'monospace', fontWeight: 800 }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: 'rgba(147,51,234,0.1)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)',
              boxShadow: '0 0 10px rgba(168,85,247,0.5)',
              transition: 'width 0.1s linear',
            }} />
          </div>
        </div>

        {/* Status chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {chips.map(({ label, done }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 99,
              background: done ? 'rgba(22,163,74,0.08)' : '#f5f3ff',
              border: `1px solid ${done ? 'rgba(22,163,74,0.25)' : 'rgba(147,51,234,0.12)'}`,
              transition: 'all 0.4s ease',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: done ? '#16a34a' : '#d8b4fe',
                boxShadow: done ? '0 0 5px rgba(22,163,74,0.5)' : 'none',
                transition: 'all 0.4s ease',
              }} />
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                color: done ? '#15803d' : '#9333ea',
                textTransform: 'uppercase', transition: 'color 0.4s ease',
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <p style={{
        position: 'absolute', bottom: 28,
        fontSize: 9, color: 'rgba(124,58,237,0.3)',
        letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace',
      }}>
        Dompu Online · Advanced Security v2.0
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: 0.5; }
        }
        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(350%); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
      `}</style>
    </div>
  )
}
