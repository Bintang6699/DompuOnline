'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Vendor } from '@/lib/types'
import { Heart, ChevronRight, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(vendor.likes_count || 0)
  const [hasMounted, setHasMounted] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      setHasMounted(true)
      const likedVendors = JSON.parse(localStorage.getItem('liked_vendors') || '[]')
      if (likedVendors.includes(vendor.id)) {
        setIsLiked(true)
      }
      mountedRef.current = true
    }
  }, [vendor.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLiked) return

    try {
      const res = await fetch(`/api/vendors/${vendor.id}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes_count)
        setIsLiked(true)
        const likedVendors = JSON.parse(localStorage.getItem('liked_vendors') || '[]')
        localStorage.setItem('liked_vendors', JSON.stringify([...likedVendors, vendor.id]))
      }
    } catch (error) {
      console.error('Error liking vendor:', error)
    }
  }

  const mainImage = vendor.media?.find(m => m.type === 'image')?.url || '/placeholder-vendor.png'

  if (!hasMounted) return <VendorCardSkeleton />

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100/50"
    >
      <Link href={`/vendor/${vendor.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={mainImage}
            alt={vendor.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="bg-white/90 backdrop-blur-md text-purple-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg flex items-center gap-1.5 border border-purple-100">
              <Package size={12} /> {vendor.categories?.name}
            </span>
          </div>
          <button
            onClick={handleLike}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md border ${
              isLiked ? 'bg-red-500 border-red-400 text-white' : 'bg-white/80 border-white/50 text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-black text-gray-900 truncate uppercase tracking-tight group-hover:text-purple-600 transition-colors">
            {vendor.name}
          </h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mt-1">{vendor.owner_name}</p>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-base font-black text-purple-600 font-mono">
              {vendor.products?.[0] ? formatCurrency(vendor.products[0].price) : 'Hubungi Seller'}
            </p>
            <div className="flex items-center gap-2 text-gray-300">
               <span className="text-[10px] font-black">{likes} LIKES</span>
               <ChevronRight size={18} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function VendorCardSkeleton() {
  return (
    <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="aspect-[4/3] bg-gray-100" />
      <div className="p-6">
        <div className="h-6 bg-gray-100 rounded-lg w-3/4 mb-3" />
        <div className="h-4 bg-gray-100 rounded-lg w-1/2 mb-6" />
      </div>
    </div>
  )
}
