'use client'
import { Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
  title: string
  text?: string
  url: string
  className?: string
}

export function ShareButton({ title, text, url, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // Construct full URL if relative
    const shareUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url: shareUrl,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 transition-all active:scale-95 ${className}`}
      title="Bagikan"
    >
      {copied ? (
        <>
          <Check size={18} className="text-green-500" />
          <span className="text-xs font-bold text-green-600">Tersalin!</span>
        </>
      ) : (
        <>
          <Share2 size={18} />
          <span className="text-xs font-bold uppercase tracking-tight">Bagikan</span>
        </>
      )}
    </button>
  )
}
