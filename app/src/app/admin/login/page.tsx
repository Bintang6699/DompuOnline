'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Eye, EyeOff, Loader2, AlertTriangle, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState('')

  // Check for redirect params (e.g., forbidden error)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'forbidden') {
      setError('Akun Anda tidak memiliki akses admin.')
    }
  }, [searchParams])

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockedUntil) {
      setCountdown('')
      return
    }

    const interval = setInterval(() => {
      const remaining = lockedUntil - Date.now()
      if (remaining <= 0) {
        setLockedUntil(null)
        setAttempts(0)
        setCountdown('')
        setError('')
        clearInterval(interval)
        return
      }
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [lockedUntil])

  // Auto-logout idle timer (30 minutes)
  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        // Only matters if user is still on login page
      }, 30 * 60 * 1000)
    }

    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keypress', resetTimer)
    resetTimer()

    return () => {
      clearTimeout(idleTimer)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keypress', resetTimer)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lockedUntil && Date.now() < lockedUntil) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setAttempts((prev) => prev + 1)

        if (res.status === 429) {
          // Rate limited
          const retryMs = data.retryAfterMs || 15 * 60 * 1000
          setLockedUntil(Date.now() + retryMs)
          setError(data.error)
        } else {
          setError(data.error || 'Login gagal')

          // Client-side lockout after 5 failed attempts
          if (attempts + 1 >= 5) {
            setLockedUntil(Date.now() + 15 * 60 * 1000)
            setError('Terlalu banyak percobaan. Akun terkunci selama 15 menit.')
          }
        }
      } else {
        // Success — redirect to admin dashboard
        const redirectTo = searchParams.get('redirect') || '/admin'
        router.push(redirectTo)
        router.refresh()
      }
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-purple-300 text-sm mt-1">DompuOnline Control Center</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          {isLocked ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-red-500" />
              </div>
              <h2 className="font-black text-gray-900 text-lg mb-2">Akun Terkunci</h2>
              <p className="text-sm text-gray-500 mb-4">
                Terlalu banyak percobaan login yang gagal.
              </p>
              <div className="bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                <p className="text-xs text-red-600 font-bold uppercase tracking-wider">
                  Coba lagi dalam
                </p>
                <p className="text-2xl font-black text-red-700 mt-1 font-mono">
                  {countdown}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Admin</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dompuonline.id"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 border border-red-100">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {attempts > 0 && attempts < 5 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 border border-amber-100 font-medium">
                  ⚠️ Percobaan {attempts}/5 — Akun akan dikunci setelah 5x gagal
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-purple-400 text-xs mt-6">
          © {new Date().getFullYear()} DompuOnline. Semua hak dilindungi.
        </p>
      </div>
    </div>
  )
}
