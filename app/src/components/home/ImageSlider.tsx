'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slider {
  id: string
  type?: 'image' | 'video'
  image_url: string
  video_url?: string
  vendor_id?: string
  news_id?: string
}

export function ImageSlider({ sliders }: { sliders: Slider[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (sliders.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliders.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [sliders.length])

  if (!sliders || sliders.length === 0) return null

  const prevSlide = () => setCurrent((c) => (c === 0 ? sliders.length - 1 : c - 1))
  const nextSlide = () => setCurrent((c) => (c + 1) % sliders.length)

  const renderContent = (s: Slider, i: number) => {
    const isVideo = s.type === 'video'
    const url = s.vendor_id ? `/vendor/${s.vendor_id}` : s.news_id ? `/news/${s.news_id}` : null

    const Media = () => (
      <>
        {isVideo ? (
          <video 
            src={s.video_url} 
            className="w-full h-full object-cover" 
            autoPlay 
            muted 
            loop 
            playsInline
          />
        ) : (
          <Image src={s.image_url} alt="Banner" fill className="object-cover" priority={i === 0} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent z-10" />
      </>
    )

    if (url) {
      return (
        <Link href={url} className="block w-full h-full relative cursor-pointer">
          <Media />
        </Link>
      )
    }

    return (
      <div className="w-full h-full relative">
        <Media />
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] bg-slate-950 overflow-hidden shadow-2xl">
      {sliders.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            i === current ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0'
          }`}
        >
          {renderContent(s, i)}
        </div>
      ))}
      
      {/* Controls */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
          >
            <ChevronRight size={20} />
          </button>
          
          {/* Progress Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {sliders.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
