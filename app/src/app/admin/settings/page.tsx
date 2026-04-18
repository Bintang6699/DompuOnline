'use client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle,
  Mail, Lock, KeyRound, Info
} from 'lucide-react'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'email' | 'password'>('password')
  
  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('')
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // General state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 2) return { score: 1, label: 'Lemah', color: 'bg-red-500' }
    if (score <= 4) return { score: 2, label: 'Sedang', color: 'bg-yellow-500' }
    return { score: 3, label: 'Kuat', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: emailCurrentPassword,
          newEmail,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal mengubah email')
      } else {
        setSuccess(data.message)
        if (data.requireRelogin) {
          setTimeout(() => {
            router.push('/admin/login')
          }, 2000)
        }
        setNewEmail('')
        setEmailCurrentPassword('')
      }
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal mengubah password')
      } else {
        setSuccess(data.message)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Pengaturan Akun</h1>
                <p className="text-sm text-gray-500">Kelola email dan password admin Anda</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Keamanan Akun</p>
              <p className="text-xs text-blue-600 mt-1">
                Untuk setiap perubahan, Anda harus memasukkan password saat ini sebagai verifikasi keamanan.
                Gunakan password yang kuat dengan kombinasi huruf besar, huruf kecil, angka, dan simbol.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1.5 bg-white rounded-2xl w-fit shadow-sm border border-gray-100">
            <button
              onClick={() => { setActiveTab('password'); setError(''); setSuccess('') }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'password'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Lock size={14} /> Ubah Password
            </button>
            <button
              onClick={() => { setActiveTab('email'); setError(''); setSuccess('') }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'email'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Mail size={14} /> Ubah Email
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-6 border border-red-100">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3 mb-6 border border-green-100">
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Password Change Form */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <KeyRound size={18} className="text-purple-600" />
                <h2 className="font-bold text-gray-900">Ubah Password</h2>
              </div>
              <form onSubmit={handleChangePassword} className="p-6 space-y-5">
                {/* Current Password */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Password Saat Ini <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Password Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      required
                      minLength={8}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-2.5">
                      <div className="flex gap-1.5 mb-1.5">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              passwordStrength.score >= level
                                ? passwordStrength.color
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-bold ${
                        passwordStrength.score === 1 ? 'text-red-500' :
                        passwordStrength.score === 2 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        Kekuatan: {passwordStrength.label}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className={`text-[11px] ${newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
                          {newPassword.length >= 8 ? '✓' : '○'} Minimal 8 karakter
                        </p>
                        <p className={`text-[11px] ${/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                          {/[A-Z]/.test(newPassword) ? '✓' : '○'} Huruf besar (A-Z)
                        </p>
                        <p className={`text-[11px] ${/[a-z]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                          {/[a-z]/.test(newPassword) ? '✓' : '○'} Huruf kecil (a-z)
                        </p>
                        <p className={`text-[11px] ${/[0-9]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                          {/[0-9]/.test(newPassword) ? '✓' : '○'} Angka (0-9)
                        </p>
                        <p className={`text-[11px] ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                          {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '○'} Simbol (!@#$...)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Konfirmasi Password Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      required
                      minLength={8}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-11 ${
                        confirmPassword && confirmPassword !== newPassword
                          ? 'border-red-300 bg-red-50/50'
                          : confirmPassword && confirmPassword === newPassword
                          ? 'border-green-300 bg-green-50/50'
                          : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">Password tidak cocok</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-xs text-green-500 mt-1.5 font-medium">✓ Password cocok</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="w-full btn-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                  {loading ? 'Memproses...' : 'Simpan Password Baru'}
                </button>
              </form>
            </div>
          )}

          {/* Email Change Form */}
          {activeTab === 'email' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Mail size={18} className="text-purple-600" />
                <h2 className="font-bold text-gray-900">Ubah Email</h2>
              </div>
              <form onSubmit={handleChangeEmail} className="p-6 space-y-5">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">
                    Mengubah email akan mengharuskan Anda login ulang dengan email baru.
                    Pastikan email baru valid dan bisa diakses.
                  </p>
                </div>

                {/* New Email */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Email Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email-baru@domain.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Current Password for verification */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Password Saat Ini <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={emailCurrentPassword}
                      onChange={(e) => setEmailCurrentPassword(e.target.value)}
                      placeholder="Masukkan password untuk verifikasi"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !newEmail || !emailCurrentPassword}
                  className="w-full btn-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={16} />}
                  {loading ? 'Memproses...' : 'Simpan Email Baru'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
