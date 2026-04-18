import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { MessageCircle, MapPin, ShieldCheck, Truck, Clock, CreditCard, Info } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-28">
      <Header />
      <main className="max-w-lg mx-auto p-5">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Info size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">Tentang DompuOnline</h1>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Digital Solutions #1</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              DompuOnline adalah platform penghubung ekonomi kreatif pertama di Kabupaten Dompu yang dirancang untuk mendigitalisasi UMKM, Jasa, dan Layanan Publik.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-2xl">
              <p className="text-xs text-yellow-800 font-semibold leading-relaxed">
                <span className="font-black">PENTING:</span> Saat ini kami beroperasi sebagai <span className="underline">PENGHUBUNG</span>. Seluruh transaksi pembayaran dan penentuan lokasi dilakukan melalui integrasi <span className="font-bold">WhatsApp</span> dan <span className="font-bold">Google Maps</span>.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-lg font-black text-gray-900 border-l-4 border-purple-600 pl-3">Aturan Main & Ketentuan</h2>
          
          <div className="grid gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <MessageCircle size={20} />
                </div>
                <h3 className="font-bold text-gray-900">Transaksi via WhatsApp</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Semua pesanan yang Anda buat akan diteruskan ke WhatsApp Penjual. Harga, biaya ongkir, dan metode pembayaran disepakati langsung antara Anda dan Penjual.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <MapPin size={20} />
                </div>
                <h3 className="font-bold text-gray-900">Lokasi Google Maps</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Akurasi lokasi sangat bergantung pada Google Maps. Kami mewajibkan pembeli (terutama Ojek/Order Food) untuk mengirimkan <span className="font-bold font-italic">Share Live Location</span> saat berkomunikasi di WhatsApp.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                  <Truck size={20} />
                </div>
                <h3 className="font-bold text-gray-900">Wajib Layanan Antar</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Bagi penjual makanan (Kuliner), <span className="font-bold text-orange-700">WAJIB memiliki kendaraan</span> dan menyediakan layanan antar. DompuOnline mengutamakan kenyamanan pelanggan untuk menerima pesanan di tempat.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                  <CreditCard size={20} />
                </div>
                <h3 className="font-bold text-gray-900">Sistem Berlangganan</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Untuk menjaga kualitas layanan, kami menggunakan sistem berlangganan bagi Mitra. Masa aktif toko akan berakhir otomatis jika tidak diperpanjang. Pembayaran bisa dilakukan via Transfer (hubungi Admin) atau datang ke kantor.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-600 to-purple-900 rounded-[32px] p-6 text-white text-center shadow-xl mb-10">
          <ShieldCheck size={48} className="mx-auto mb-4 text-purple-200 opacity-50" />
          <h3 className="text-xl font-black mb-2">Siap Bergabung?</h3>
          <p className="text-xs text-purple-100 mb-6 leading-relaxed px-4">
            Jadilah bagian dari revolusi ekonomi digital di Dompu. Daftarkan tokomu sekarang!
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/daftar" className="bg-white text-purple-900 font-extrabold py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm">
              Daftar Mitra Sekarang
            </Link>
            <Link href="/contact" className="bg-white/10 text-white font-bold py-3 rounded-xl border border-white/20 text-xs">
              Hubungi Admin Kami
            </Link>
          </div>
        </section>

        <p className="text-center text-[10px] text-gray-400 font-medium">
          DompuOnline v1.2 · Buatan Anak Daerah untuk Kemajuan Dompu
        </p>
      </main>
      <BottomNav />
    </div>
  )
}
