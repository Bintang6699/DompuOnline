import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  let finalAmount = amount
  
  // Auto-correction for common mistake (inputting 15 instead of 15000)
  // In IDR, literal prices below 1000 are extremely rare for platform services.
  // E.g. '15' -> 15000, '50' -> 50000, '100' -> 100000
  if (finalAmount > 0 && finalAmount < 1000) {
    finalAmount = finalAmount * 1000
  }

  const formatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `Rp. ${formatter.format(finalAmount)}`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Makassar',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Makassar',
    timeZoneName: 'short',
  }).format(new Date(date))
}

export function buildWhatsAppUrl(phone: string, vendorName: string): string {
  const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '62')
  const message = encodeURIComponent(
    `Halo, saya tertarik dengan layanan ${vendorName} di DompuOnline. Bisa minta info lebih lanjut?`
  )
  return `https://wa.me/${cleanPhone}?text=${message}`
}

export function buildPhoneUrl(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '+62')
  return `tel:${cleanPhone}`
}

export function getSubscriptionLabel(plan: string): string {
  const labels: Record<string, string> = {
    'free_1_month': 'Gratis 1 Bulan',
    '1_month': '1 Bulan (30 Hari)',
    '3_month': '3 Bulan (90 Hari)',
    '6_month': '6 Bulan (180 Hari)',
    '1_year': '1 Tahun (365 Hari)',
  }
  return labels[plan] || plan
}

export function getSubscriptionPrice(plan: string): number {
  const prices: Record<string, number> = {
    'free_1_month': 0,
    '1_month': 9900,
    '3_month': 30000,
    '6_month': 179000,
    '1_year': 499000,
  }
  return prices[plan] || 0
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    surveyed: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
