'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { Store, X } from 'lucide-react'

interface NotificationData {
  id: string
  name: string
  description: string
  categorySlug: string
  imageUrl?: string
}

export function RealtimeNotification() {
  const [notification, setNotification] = useState<NotificationData | null>(null)

  useEffect(() => {
    // Listen to changes on the vendors table
    const channel = supabase
      .channel('vendors-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vendors' },
        async (payload: any) => {
          const { new: newRecord, old: oldRecord } = payload
          
          // Check if it transitioned to approved and active
          const wasNotApproved = oldRecord.status !== 'approved' || oldRecord.subscription_status !== 'active'
          const isNowApproved = newRecord.status === 'approved' && newRecord.subscription_status === 'active'

          if (wasNotApproved && isNowApproved) {
            // Fetch thumbnail image from media table
            const { data: media } = await supabase
              .from('media')
              .select('url')
              .eq('vendor_id', newRecord.id)
              .eq('type', 'thumb')
              .single()

            // Fetch category slug
            const { data: category } = await supabase
              .from('categories')
              .select('slug')
              .eq('id', newRecord.category_id)
              .single()

            setNotification({
              id: newRecord.id,
              name: newRecord.name,
              description: newRecord.description,
              categorySlug: category?.slug || 'bisnis',
              imageUrl: media?.url,
            })

            // Auto dismiss after 6 seconds
            setTimeout(() => {
              setNotification(null)
            }, 6000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed top-4 left-4 right-4 z-[9999] max-w-sm mx-auto shadow-2xl rounded-2xl bg-white border border-purple-100 overflow-hidden"
        >
          <div className="absolute top-2 right-2 z-10">
            <button 
              onClick={() => setNotification(null)}
              className="w-6 h-6 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <Link href={`/vendor/${notification.id}`} onClick={() => setNotification(null)}>
            <div className="p-4 flex gap-4 items-start">
              <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-purple-50 flex items-center justify-center border border-purple-100">
                {notification.imageUrl ? (
                  <Image src={notification.imageUrl} alt={notification.name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <Store size={24} className="text-purple-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Mitra Baru Bergabung! 🎉</p>
                <h4 className="font-bold text-gray-900 text-sm truncate">{notification.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">{notification.description}</p>
                <div className="mt-2 inline-block px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-100">
                  Lihat Detail &rarr;
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
