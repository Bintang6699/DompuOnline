'use client'
import { Share2, Copy, Check, MessageCircle, Globe, X } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
  title: string
  text?: string
  url: string
  className?: string
}

export function ShareButton({ title, text, url, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const fullUrl = typeof window !== 'undefined'
    ? (url.startsWith('http') ? url : `${window.location.origin}${url}`)
    : url

  const shareText = text || title

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: fullUrl,
        })
        return true
      } catch (err) {
        console.error('Error sharing:', err)
        return false
      }
    }
    return false
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} className="text-green-500" />,
      color: 'bg-green-50',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + fullUrl)}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: <Globe size={20} className="text-blue-600" />,
      color: 'bg-blue-50',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, '_blank')
    },
    {
      name: 'Salin Link',
      icon: copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-gray-600" />,
      color: 'bg-gray-50',
      action: copyToClipboard
    }
  ]

  return (
    <>
      <button
        onClick={async () => {
          const shared = await handleNativeShare()
          if (!shared) setIsOpen(true)
        }}
        className={`inline-flex items-center justify-center gap-2 transition-all active:scale-95 ${className}`}
        title="Bagikan"
      >
        <Share2 size={18} />
        <span className="text-xs font-bold uppercase tracking-tight">Bagikan</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsOpen(false)}>
          <div
            className="bg-white rounded-t-[32px] rounded-b-[32px] w-full max-w-sm p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">Bagikan ke Teman</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {shareOptions.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => {
                    opt.action()
                    if (opt.name !== 'Salin Link') setIsOpen(false)
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 ${opt.color} rounded-2xl flex items-center justify-center transition-transform group-active:scale-90`}>
                    {opt.icon}
                  </div>
                  <span className="text-[11px] font-bold text-gray-600">{opt.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
              <p className="text-[10px] text-gray-400 font-mono truncate flex-1">{fullUrl}</p>
              <button
                onClick={copyToClipboard}
                className="text-[10px] font-black text-purple-600 uppercase tracking-tighter"
              >
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
