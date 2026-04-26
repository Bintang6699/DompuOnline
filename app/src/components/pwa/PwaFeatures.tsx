'use client'
import { useState, useEffect, useRef } from 'react'
import { Smartphone, Download, CheckCircle, Wifi, WifiOff, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function PwaFeatures() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (mountedRef.current) return
    
    // 1. Check Installation Status
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true)
      setIsLoading(false)
    } else {
      setTimeout(() => setIsLoading(false), 2000)
    }

    // 2. Offline Detection
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 3. PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    mountedRef.current = true

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setShowInstallBanner(false)
    }
    setInstallPrompt(null)
  }

  return (
    <AnimatePresence>
      {/* Offline Alert */}
      {!isOnline && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white py-3 px-4 flex items-center justify-center gap-3 shadow-xl"
        >
          <WifiOff size={20} className="animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest">Koneksi Terputus - Mode Offline Aktif</span>
        </motion.div>
      )}

      {/* Online Back Alert */}
      {isOnline && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          className="hidden"
        />
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && !isInstalled && (
        <div className="fixed bottom-24 left-4 right-4 z-[90]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-indigo-950 text-white rounded-[32px] p-6 shadow-2xl border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />

            <button 
              onClick={() => setShowInstallBanner(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-950 shadow-xl">
                <Smartphone size={28} />
              </div>
              <div>
                <h3 className="font-black text-lg leading-tight uppercase tracking-tight">Instal Aplikasi</h3>
                <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mt-1">Akses Lebih Cepat & Ringan</p>
              </div>
            </div>

            <button
              onClick={handleInstall}
              className="w-full bg-white text-indigo-950 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-50 active:scale-95 transition-all uppercase tracking-widest text-xs"
            >
              <Download size={18} /> PASANG SEKARANG
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
