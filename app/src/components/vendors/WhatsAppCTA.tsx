'use client'
import { useState } from 'react'
import { MessageCircle, MapPin, AlertCircle, X, Navigation } from 'lucide-react'

interface Props {
  phone: string
  vendorName: string
  isTransport: boolean
  className?: string
  children?: React.ReactNode
  shrink?: boolean
}

export function WhatsAppCTA({ phone, vendorName, isTransport, className, children, shrink }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<string | null>(null)

  const buildMessage = (locationUrl?: string) => {
    let message = `Halo, saya ingin memesan dari ${vendorName}.\n\n`
    if (isTransport) {
      message = `Halo, saya ingin pesan ojek/mobil.\n\n`
      if (locationUrl) {
        message += `📍 Lokasi saya saat ini:\n${locationUrl}\n\n`
      } else {
        message += `📍 Lokasi saya:\n(Silakan kirim Share Live Location ya agar mudah ditemukan)\n\n`
      }
    }
    message += `Terima kasih 🙏`
    return `https://wa.me/${phone.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(message)}`
  }

  const handleFetchLocation = () => {
    setGettingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation(`https://www.google.com/maps?q=${latitude},${longitude}`)
          setGettingLocation(false)
        },
        (error) => {
          console.error(error)
          alert('Gagal mengambil lokasi. Pastikan GPS aktif dan izinkan akses lokasi.')
          setGettingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      alert('Browser Anda tidak mendukung layanan lokasi.')
      setGettingLocation(false)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isTransport) {
      setShowModal(true)
    } else {
      window.open(buildMessage(), '_blank')
    }
  }

  const proceedToWhatsApp = () => {
    window.open(buildMessage(userLocation || undefined), '_blank')
    setShowModal(false)
  }

  return (
    <>
      <button 
        onClick={handleClick} 
        className={className || `flex-1 btn-whatsapp text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 ${shrink ? 'py-1.5' : 'py-2.5'}`}
      >
        {children || (
          <>
            <MessageCircle size={shrink ? 12 : 15} />
            Hubungi
          </>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <MapPin size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-black mb-0.5">Bagikan Lokasi Anda</h3>
              <p className="text-purple-100 text-[11px]">Untuk mempermudah driver menemukan Anda.</p>
            </div>

            <div className="p-4 space-y-4">
              {/* Instructions */}
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-purple-800 mb-2">Cara share live location di WhatsApp:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { text: 'Buka Obrolan WhatsApp', icon: '💬' },
                    { text: 'Klik ikon Lampiran', icon: '📎' },
                    { text: 'Pilih opsi "Lokasi"', icon: '📍' },
                    { text: 'Tekan "Share Live Location"', icon: '🟢' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-purple-900 font-bold bg-white/50 p-1.5 rounded-lg">
                      <span className="text-xs">{step.icon}</span>
                      <span className="leading-tight">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 bg-yellow-50 text-yellow-800 p-2.5 rounded-xl border border-yellow-100">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-yellow-500" />
                <p className="text-[10px] font-semibold leading-tight">
                  Driver mungkin kesulitan menjemput Anda jika tidak mengirim Share Live Location / Lokasi akurat.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {!userLocation ? (
                  <button 
                    onClick={handleFetchLocation}
                    disabled={gettingLocation}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-purple-100 text-purple-700 text-xs font-bold hover:bg-purple-50 transition-colors"
                  >
                    <Navigation size={16} className={gettingLocation ? 'animate-pulse' : ''} />
                    {gettingLocation ? 'Mencari Lokasi...' : 'Ambil Lokasi Saya (Otomatis)'}
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold">
                    <MapPin size={16} />
                    Lokasi Berhasil Diambil ✓
                  </div>
                )}
                
                <button 
                  onClick={proceedToWhatsApp}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-colors"
                >
                  Lanjut ke WhatsApp <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
