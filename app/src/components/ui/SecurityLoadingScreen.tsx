'use client'
import { useEffect, useState } from 'react'

const SCAN_MESSAGES = [
  'Menginisialisasi sistem keamanan Dompu Online...',
  'Memverifikasi autentisitas data bisnis...',
  'Memindai pendaftaran duplikat...',
  'Menganalisis validasi keamanan...',
  'Memeriksa integritas informasi usaha...',
  'Menjalankan deteksi kemiripan lanjutan...',
  'Memproses sidik jari perangkat...',
  'Verifikasi hampir selesai...',
]

interface SecurityLoadingScreenProps {
  onComplete?: () => void
  duration?: number // ms
}

export function SecurityLoadingScreen({ onComplete, duration = 5000 }: SecurityLoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState('')

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % SCAN_MESSAGES.length)
    }, duration / SCAN_MESSAGES.length)
    return () => clearInterval(interval)
  }, [duration])

  // Progress bar
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

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(ellipse at 50% 40%, #1a0533 0%, #0a0010 60%, #000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Animated grid background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.07,
        backgroundImage: 'linear-gradient(#9333ea 1px, transparent 1px), linear-gradient(90deg, #9333ea 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        animation: 'gridMove 8s linear infinite',
      }} />

      {/* Outer glow rings */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        borderRadius: '50%',
        border: '1px solid rgba(147,51,234,0.15)',
        animation: 'pulse 3s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: 500, height: 500,
        borderRadius: '50%',
        border: '1px solid rgba(147,51,234,0.08)',
        animation: 'pulse 3s ease-in-out infinite 0.5s',
      }} />
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        borderRadius: '50%',
        border: '1px solid rgba(147,51,234,0.05)',
        animation: 'pulse 3s ease-in-out infinite 1s',
      }} />

      {/* Main glass card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        padding: '48px 40px 40px',
        maxWidth: 440,
        width: '90vw',
        borderRadius: 28,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(147,51,234,0.25)',
        boxShadow: '0 0 80px rgba(147,51,234,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        {/* Eye Video */}
        <div style={{
          position: 'relative',
          width: 160, height: 160,
          borderRadius: '50%',
          overflow: 'hidden',
          marginBottom: 32,
          boxShadow: '0 0 60px rgba(147,51,234,0.5), 0 0 120px rgba(147,51,234,0.2)',
          border: '2px solid rgba(147,51,234,0.4)',
        }}>
          <video
            src="/animationLogo/eyes.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'hue-rotate(260deg) saturate(1.5)' }}
          />
          {/* Scanning line overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(transparent 40%, rgba(147,51,234,0.15) 50%, transparent 60%)',
            animation: 'scanLine 2s ease-in-out infinite',
          }} />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <p style={{
            fontSize: 10, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase',
            color: 'rgba(147,51,234,0.8)', marginBottom: 8,
          }}>
            DOMPU ONLINE SECURITY SYSTEM
          </p>
          <h2 style={{
            fontSize: 20, fontWeight: 800,
            color: '#fff', lineHeight: 1.3, margin: 0,
          }}>
            Memproses Data Anda
          </h2>
        </div>

        {/* Scanning message */}
        <div style={{
          marginTop: 20, marginBottom: 28,
          minHeight: 40, textAlign: 'center',
          padding: '10px 16px',
          borderRadius: 12,
          background: 'rgba(147,51,234,0.08)',
          border: '1px solid rgba(147,51,234,0.15)',
          width: '100%',
        }}>
          <p style={{
            fontSize: 12, color: 'rgba(200,150,255,0.9)', fontFamily: 'monospace',
            lineHeight: 1.5, margin: 0,
          }}>
            <span style={{ color: '#a855f7', marginRight: 6 }}>›</span>
            {SCAN_MESSAGES[messageIndex]}{dots}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', marginBottom: 16 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginBottom: 8,
          }}>
            <span style={{ fontSize: 10, color: 'rgba(200,150,255,0.6)', fontFamily: 'monospace' }}>
              SECURITY SCAN
            </span>
            <span style={{ fontSize: 10, color: '#a855f7', fontFamily: 'monospace', fontWeight: 700 }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{
            height: 4, borderRadius: 999,
            background: 'rgba(147,51,234,0.15)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 999,
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)',
              boxShadow: '0 0 12px rgba(168,85,247,0.8)',
              transition: 'width 0.1s linear',
            }} />
          </div>
        </div>

        {/* Status chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Enkripsi Aktif', done: progress > 15 },
            { label: 'IP Terverifikasi', done: progress > 35 },
            { label: 'Sidik Jari', done: progress > 55 },
            { label: 'Anti-Duplikat', done: progress > 75 },
          ].map(({ label, done }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 99,
              background: done ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.4s ease',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: done ? '#22c55e' : 'rgba(255,255,255,0.2)',
                boxShadow: done ? '0 0 6px #22c55e' : 'none',
                transition: 'all 0.4s ease',
              }} />
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                color: done ? 'rgba(134,239,172,0.9)' : 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                transition: 'color 0.4s ease',
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <p style={{
        position: 'absolute', bottom: 32,
        fontSize: 10, color: 'rgba(255,255,255,0.2)',
        letterSpacing: 2, textTransform: 'uppercase',
        fontFamily: 'monospace',
      }}>
        Dompu Online · Advanced Security v2.0
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.5; }
        }
        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
      `}</style>
    </div>
  )
}
