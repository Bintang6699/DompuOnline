'use client'
import { useState } from 'react'
import { Share2, MessageCircle, Facebook, Link as LinkIcon, Check, Copy, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShareButtonProps {
  title: string
  text: string
  url: string
  className?: string
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: fullUrl })
      } catch (error) {
        console.error('Error sharing:', error)
        setShowModal(true)
      }
    } else {
      setShowModal(true)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      color: 'bg-green-500',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + fullUrl)}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      color: 'bg-blue-600',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, '_blank')
    },
    {
      name: copied ? 'Tersalin' : 'Salin Link',
      icon: copied ? <Check size={20} /> : <Copy size={20} />,
      color: 'bg-gray-700',
      action: copyToClipboard
    }
  ]

  return (
    <>
      <button onClick={handleShare} className={className}>
        <Share2 size={20} />
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Bagikan</h3>

              <div className="grid grid-cols-3 gap-4">
                {shareOptions.map((opt) => (
                  <button
                    key={opt.name}
                    onClick={opt.action}
                    className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
                  >
                    <div className={`w-14 h-14 ${opt.color} text-white rounded-[20px] flex items-center justify-center shadow-lg`}>
                      {opt.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{opt.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
            <div className="absolute inset-0 -z-10" onClick={() => setShowModal(false)} />
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
