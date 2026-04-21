'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, WifiOff, Bell, Share, PlusSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export function PwaFeatures() {
  const [isOffline, setIsOffline] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string }[]>([]);

  useEffect(() => {
    // 1. Loading Animation (Splash Screen)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    // Simulate splash screen for PWA
    if (isStandalone) {
      setTimeout(() => setIsLoading(false), 2000);
    } else {
      setIsLoading(false);
    }

    // 2. Offline Detection
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. PWA Install Prompt
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't show if already standalone
      if (!isStandalone) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS prompt if not installed
    if (isIosDevice && !isStandalone) {
      // Check if already dismissed in session
      if (!sessionStorage.getItem('iosInstallPromptDismissed')) {
         setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    }

    // 4. Supabase Realtime Notifications for new Mitra
    const channel = supabase
      .channel('public:vendors')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vendors' },
        (payload) => {
          const newMitra = payload.new;
          if (newMitra.status === 'approved') {
            const newNotif = {
              id: Date.now().toString(),
              title: '🎉 Mitra Baru Bergabung!',
              message: `${newMitra.name || 'Sebuah usaha baru'} kini hadir di Dompu Online.`,
            };
            setNotifications((prev) => [...prev, newNotif]);
            
            // Auto remove notification after 5 seconds
            setTimeout(() => {
              setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissIOSPrompt = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('iosInstallPromptDismissed', 'true');
  };

  return (
    <>
      {/* 1. Loading Splash Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-purple-900 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="relative w-32 h-32 mb-8"
            >
              <Image src="/logo/logo2.png" alt="Loading" fill className="object-contain drop-shadow-2xl" />
            </motion.div>
            <div className="w-48 h-2 bg-purple-950 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-full h-full bg-white rounded-full"
              />
            </div>
            <p className="text-white mt-4 font-black uppercase tracking-widest text-sm animate-pulse">Memuat...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. No Connection UI */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[9998] bg-red-500 text-white p-4 flex flex-col items-center justify-center shadow-2xl safe-area-top"
          >
            <div className="flex items-center gap-3 font-black">
              <WifiOff size={24} />
              <span>Tidak Ada Koneksi Internet</span>
            </div>
            <p className="text-xs mt-1 text-red-100 font-medium text-center">
              Mohon periksa jaringan Anda. Beberapa fitur mungkin tidak berfungsi.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Install App Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-[9990] bg-white rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-purple-100"
          >
            <button 
              onClick={isIOS ? dismissIOSPrompt : () => setShowInstallPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1"
            >
              <X size={16} />
            </button>
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl p-2 shrink-0 border border-purple-100">
                <div className="relative w-full h-full">
                  <Image src="/logo/logo2.png" alt="App Icon" fill className="object-contain drop-shadow-md" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 text-lg leading-tight">Install Dompu Online</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                  Akses lebih cepat, tanpa perlu buka browser!
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="mt-5 bg-purple-50 rounded-2xl p-4 border border-purple-100">
                 <p className="text-xs text-purple-900 font-bold mb-3 flex items-center gap-2">
                   Untuk install di iOS (iPhone/iPad):
                 </p>
                 <ol className="text-[11px] text-purple-800 space-y-2 font-medium">
                   <li className="flex items-center gap-2">1. Ketuk ikon <Share size={14} className="text-blue-500" /> (Share) di menu bawah</li>
                   <li className="flex items-center gap-2">2. Gulir ke bawah lalu pilih <PlusSquare size={14} /> <strong>Add to Home Screen</strong></li>
                 </ol>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full mt-5 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-200 transition-all active:scale-95"
              >
                <Download size={18} /> INSTALL SEKARANG
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Realtime Notifications */}
      <div className="fixed top-4 right-4 z-[9995] flex flex-col gap-3 pointer-events-none safe-area-top">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-white rounded-2xl p-4 shadow-2xl border border-purple-100 flex items-start gap-3 max-w-[300px] pointer-events-auto"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Bell size={20} className="animate-bounce" />
              </div>
              <div className="flex-1 pr-4">
                <h4 className="font-black text-sm text-gray-900 leading-tight">{notif.title}</h4>
                <p className="text-[11px] text-gray-500 mt-1 font-medium leading-snug">{notif.message}</p>
              </div>
              <button 
                onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                className="text-gray-400 hover:text-gray-600 absolute top-2 right-2 p-1"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
