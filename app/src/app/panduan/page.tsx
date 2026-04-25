import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { BookOpen, CheckCircle, Info, ShieldAlert, MapPin, Truck, Smartphone, Building, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Panduan Pendaftaran Mitra & Tentang Kami | DompuOnline',
}

export default function PanduanPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="max-w-lg mx-auto pb-28">
        <div className="gradient-hero text-white px-5 pt-8 pb-10">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={24} className="text-purple-300" />
            <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Tentang Kami</span>
          </div>
          <h1 className="text-3xl font-black mb-3">Visi Misi & Panduan</h1>
          <div className="text-white/90 text-sm leading-relaxed font-medium space-y-2 max-w-[280px]">
            <p>Membantu Dompu go digital.</p>
            <p>Memudahkan jual beli, transportasi & jasa secara online di seluruh area Dompu.</p>
          </div>
        </div>

        <div className="px-5 mt-6 space-y-6">
          {/* SYARAT KETAT & SISTEM KERJA */}
          <section className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 shadow-sm border border-blue-200">
            <h2 className="text-lg font-black text-blue-900 mb-4 flex items-center gap-2">
              <Info className="text-blue-600" size={20} shrink-0 />
              Sistem Jual Beli & Syarat Wajib
            </h2>
            <div className="space-y-4 text-sm text-blue-900/80 leading-relaxed font-medium">
              <p>
                Platform DompuOnline hadir sebagai etalase digital. Harap dipahami bahwa saat ini <strong>KAMI SANGAT BERGANTUNG PADA WHATSAPP & GOOGLE MAPS</strong> untuk segala jenis transaksi dan penentuan lokasi.
              </p>
              
              <div className="bg-white/60 p-4 rounded-2xl space-y-3 mt-2">
                <div className="flex items-start gap-3">
                  <Smartphone className="text-blue-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h3 className="font-bold text-blue-900">Transaksi via WhatsApp</h3>
                    <p className="text-xs">Pembeli yang tertarik akan langsung diarahkan ke nomor WhatsApp Anda. Pastikan selalu aktif dan responsif!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h3 className="font-bold text-blue-900">Lokasi via Google Maps</h3>
                    <p className="text-xs">Titik jemput (Transport) atau pengantaran barang sangat mengandalkan Share Lokasi (Live Location) di WhatsApp.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-blue-200/50 pt-3">
                  <Truck className="text-orange-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h3 className="font-black text-orange-700">WAJIB ADA KENDARAAN (KULINER)</h3>
                    <p className="text-xs font-bold text-orange-800">Khusus bagi penjual makanan/minuman, Anda <span className="underline">wajib memiliki kendaraan sendiri</span> untuk menyediakan layanan antar makanan langsung ke tempat pembeli.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PEMBAYARAN & LANGGANAN */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <Building className="text-purple-500 shrink-0" size={20} />
              Pembayaran & Langganan
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed mb-5">
              <p className="mb-2">
                Untuk pembayaran perpanjangan biaya berlangganan agar toko Anda tetap tampil, Anda bisa memilih dua cara termudah:
              </p>
              <ul className="space-y-2 font-medium">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 block"></span> Transfer online dengan Chat Admin</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 block"></span> Datang langsung ke kantor fisik kami</li>
              </ul>
            </div>
            
            <Link 
              href="/contact" 
              className="btn-primary w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-200 hover:-translate-y-1 transition-transform"
            >
              Hubungi / Kunjungi Kantor Admin <ArrowRight size={18} />
            </Link>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-500 shrink-0" size={20} />
              Panduan Pendaftaran Mitra
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>Proses pendaftaran di platform kami dirancang agar sangat mudah:</p>
              <ul className="list-decimal pl-5 space-y-2 font-medium text-gray-700">
                <li>Klik tombol &quot;Daftar Mitra&quot;.</li>
                <li>Pilih kategori usaha (Transportasi, Kuliner, Belanja, Jasa, atau Loker).</li>
                <li>Lengkapi formulir secara jelas (Ketik harga berupa angka, contoh: 15000).</li>
                <li>Unggah foto thumbnail jernih milik Anda.</li>
                <li>Pilih paket masa aktif yang sesuai dan kirim!</li>
              </ul>
            </div>
          </section>

          <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border border-red-100">
            <h2 className="text-lg font-black text-red-800 mb-4 flex items-center gap-2">
              <ShieldAlert className="text-red-500 shrink-0" size={20} />
              Aturan Ketat (Rules)
            </h2>
            <div className="text-sm text-red-900/80 leading-relaxed font-medium space-y-3">
              <p>Untuk menjaga kualitas dan keamanan platform bagi seluruh pelanggan di Dompu, kami menetapkan larangan keras:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5 shrink-0">✖</span>
                  Tidak boleh mengunggah gambar yang tidak senonoh, pornografi, atau SARA (No inappropriate/indecent images).
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5 shrink-0">✖</span>
                  Murni dilarang keras menjual produk-produk ilegal yang melanggar hukum (No illegal products).
                </li>
              </ul>
              <div className="mt-3 bg-red-100/50 p-3 rounded-xl border border-red-200">
                <p className="text-xs font-bold text-red-800">
                  ⚠️ Akun mitra yang telah kedaluwarsa masa aktifnya akan disembunyikan otomatis. Pelanggaran berat menyebabkan penghapusan permanen tanpa refund!
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
