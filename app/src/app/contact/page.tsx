import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { getSettings } from '@/app/actions/settings'
import { Phone, Mail, Camera, MapPin, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const settings = await getSettings()

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32">
      <Header />
      <main className="max-w-lg mx-auto p-5">
        <h1 className="text-2xl font-black text-gray-900 mb-2">Pusat Bantuan & Kontak</h1>
        <p className="text-sm text-gray-500 mb-6">Hubungi admin DompuOnline jika ada kendala pendaftaran, pembayaran langganan, atau keluhan pelanggan.</p>

        <div className="space-y-4">
          {settings.whatsapp && (
            <a 
              href={`https://wa.me/${settings.whatsapp}?text=Halo%20Admin%20DompuOnline,%20saya%20butuh%20bantuan...`} 
              target="_blank" 
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-green-300 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-500 transition-colors">
                <MessageCircle size={24} className="text-green-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900">WhatsApp Admin</h3>
                <p className="text-sm text-gray-500">Respon cepat (Jam Kerja)</p>
              </div>
            </a>
          )}

          {settings.instagram && (
            <a 
              href={settings.instagram} 
              target="_blank" 
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-pink-300 transition-colors group"
            >
              <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-pink-500 transition-colors">
                <Camera size={24} className="text-pink-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900">Instagram</h3>
                <p className="text-sm text-gray-500">@dompuonline</p>
              </div>
            </a>
          )}

          {settings.tiktok && (
            <a 
              href={settings.tiktok} 
              target="_blank" 
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-black transition-colors group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-black transition-colors">
                <span className="font-black text-lg text-black group-hover:text-white">🎵</span>
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900">TikTok</h3>
                <p className="text-sm text-gray-500">Lihat review & keramaian</p>
              </div>
            </a>
          )}

          {settings.email && (
            <a 
              href={`mailto:${settings.email}`}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-blue-300 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-colors">
                <Mail size={24} className="text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900">Email Admin / Kerjasama</h3>
                <p className="text-sm text-gray-500">{settings.email}</p>
              </div>
            </a>
          )}

          {settings.address && (
            <a href={settings.address.startsWith('http') ? settings.address : `https://${settings.address}`} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:border-red-300 transition-colors group mt-6 block">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-red-500 transition-colors">
                <MapPin size={24} className="text-red-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900">Link Alamat (Maps)</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">{settings.address}</p>
                <div className="mt-3 inline-flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wide">
                  Buka Maps
                </div>
              </div>
            </a>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
