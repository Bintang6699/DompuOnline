'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, MapPin, Star, Crown, CheckCircle, Truck, Heart } from 'lucide-react'
import { Vendor } from '@/lib/types'
import { useState, useEffect } from 'react'
import { buildPhoneUrl, formatCurrency } from '@/lib/utils'
import { WhatsAppCTA } from './WhatsAppCTA'
import { ShareButton } from '@/components/ui/ShareButton'

interface VendorCardProps {
  vendor: Vendor
  shrink?: boolean
}

export function VendorCard({ vendor, shrink }: VendorCardProps) {
  const [likes, setLikes] = useState(vendor.likes_count || 0)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const likedVendors = JSON.parse(localStorage.getItem('liked_vendors') || '[]')
    if (likedVendors.includes(vendor.id)) {
      setIsLiked(true)
    }
  }, [vendor.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLiked) return

    // Optimistic UI update
    setLikes(prev => prev + 1)
    setIsLiked(true)
    const likedVendors = JSON.parse(localStorage.getItem('liked_vendors') || '[]')
    localStorage.setItem('liked_vendors', JSON.stringify([...likedVendors, vendor.id]))

    try {
      const res = await fetch(`/api/vendors/${vendor.id}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes_count)
      } else {
        // Revert on error
        setLikes(prev => prev - 1)
        setIsLiked(false)
        localStorage.setItem('liked_vendors', JSON.stringify(likedVendors.filter((id: string) => id !== vendor.id)))
      }
    } catch (err) {
      console.error('Error liking vendor:', err)
      // Revert on error
      setLikes(prev => prev - 1)
      setIsLiked(false)
      localStorage.setItem('liked_vendors', JSON.stringify(likedVendors.filter((id: string) => id !== vendor.id)))
    }
  }

  const coverImage = vendor.media?.find((m) => (m.type as string) === 'image' || (m.type as string) === 'thumb')?.url || vendor.media?.[0]?.url
  const rating = vendor.ratings?.[0]
  const avgRating = rating
    ? ((rating.quality_score + rating.cleanliness_score + rating.trust_score) / 3).toFixed(1)
    : null

  // Calculate minimum price
  const prices: number[] = []
  if (vendor.products && vendor.products.length > 0) {
    vendor.products.forEach(p => prices.push(p.price))
  }
  if (vendor.services && vendor.services.length > 0) {
    vendor.services.forEach(s => s.price && prices.push(s.price))
  }
  const minPrice = prices.length > 0 ? Math.min(...prices) : null

  return (
    <div className={`vendor-card bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col h-full border border-gray-100 ${shrink ? '' : ''}`}>
      {/* Cover Image */}
      <Link href={`/vendor/${vendor.id}`} className={`block relative bg-gradient-to-br from-purple-100 to-purple-50 overflow-hidden shrink-0 ${shrink ? 'aspect-[4/3]' : 'aspect-[16/9]'}`}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={vendor.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-5xl">{vendor.categories?.icon || '🏪'}</span>
          </div>
        )}
        {/* Featured badge */}
        {vendor.is_featured && (
          <div className="absolute top-2 left-2">
            <span className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2.5 py-1 rounded-full featured-pulse shadow-sm">
              <Crown size={10} />
              Unggulan
            </span>
          </div>
        )}
        {/* Category badge & Likes */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
              isLiked
              ? 'bg-red-500 text-white shadow-sm scale-105'
              : 'bg-black/60 text-white hover:bg-black/80'
            }`}
          >
            <Heart size={12} className={isLiked ? 'fill-current' : ''} />
            <span className="text-[10px] font-black">{likes}</span>
          </button>
          <span className="bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
            {vendor.categories?.name || 'Bisnis'}
          </span>
          {vendor.is_cod && (
            <span className="bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shadow-sm">
              <Truck size={10} /> COD
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className={`${shrink ? 'p-2.5' : 'p-4'} flex flex-col flex-1`}>
        <Link href={`/vendor/${vendor.id}`}>
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className={`font-black text-gray-900 leading-tight line-clamp-1 ${shrink ? 'text-[11px] sm:text-sm' : 'text-base'}`}>{vendor.name}</h3>
            {avgRating && (
              <div className="flex items-center gap-0.5 shrink-0">
                <Star size={shrink ? 10 : 12} className="text-yellow-400 fill-yellow-400" />
                <span className={`${shrink ? 'text-[9px]' : 'text-xs'} font-black text-gray-700`}>{avgRating}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 mb-1.5">
            <CheckCircle size={shrink ? 9 : 12} className="text-green-500 shrink-0" />
            <span className={`${shrink ? 'text-[9px]' : 'text-xs'} text-gray-500 line-clamp-1 font-medium`}>
              Terverifikasi · {vendor.owner_name}
            </span>
          </div>
          
          <p className={`${shrink ? 'text-[9px] sm:text-[10px] line-clamp-2 mb-2 h-7' : 'text-xs line-clamp-2 mb-3 h-8'} text-gray-400 leading-relaxed font-medium`}>
            {vendor.description}
          </p>

          {vendor.hashtags && vendor.hashtags.length > 0 && !shrink && (
            <div className="flex flex-wrap gap-1 mb-3">
              {vendor.hashtags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[9px] font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-100">#{tag}</span>
              ))}
            </div>
          )}
          
          {minPrice !== null && (
            <div className={`${shrink ? 'mb-1.5' : 'mb-3'}`}>
              <span className={`${shrink ? 'text-[7px] sm:text-[9px]' : 'text-[10px]'} text-gray-400 font-black block leading-none mb-0.5 uppercase tracking-tighter`}>Mulai dari</span>
              <p className={`${shrink ? 'text-[10px] sm:text-xs' : 'text-sm'} font-black text-purple-600 leading-none whitespace-nowrap`}>{formatCurrency(minPrice)}</p>
            </div>
          )}
          
          {vendor.maps_link && (
            <div className={`flex items-center gap-1 text-gray-400 ${shrink ? 'mb-1.5' : 'mb-3'}`}>
              <MapPin size={shrink ? 8 : 11} className="text-purple-400 shrink-0" />
              <span className={`${shrink ? 'text-[8px] sm:text-[10px]' : 'text-xs'} line-clamp-1 font-medium`}>Dompu, NTB</span>
            </div>
          )}
        </Link>

        {/* CTA Buttons */}
        <div className={`flex gap-1 mt-auto ${shrink ? 'pt-1' : 'pt-2'}`}>
          <WhatsAppCTA 
            phone={vendor.phone} 
            vendorName={vendor.name} 
            isTransport={vendor.categories?.slug === 'transport'}
            shrink={shrink}
          />
          {!shrink && (
            <>
              <a
                href={buildPhoneUrl(vendor.phone)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
                title="Telepon"
              >
                <Phone size={15} />
              </a>
              <ShareButton
                title={vendor.name}
                text={`Cek ${vendor.name} di DompuOnline! ${vendor.description.slice(0, 100)}...`}
                url={`/vendor/${vendor.id}`}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function VendorCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="aspect-[16/9] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 skeleton rounded-lg" />
        <div className="h-3 w-1/2 skeleton rounded-lg" />
        <div className="h-8 w-full skeleton rounded-lg" />
      </div>
    </div>
  )
}
