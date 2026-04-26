'use client'

import * as React from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Media } from "@/lib/types"

interface VendorImageSliderProps {
  media: Media[]
  vendorName: string
}

export function VendorImageSlider({ media, vendorName }: VendorImageSliderProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  const images = media.filter(m => m.type === 'image' || m.type === 'thumb')

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-purple-50 flex items-center justify-center text-7xl rounded-[40px] overflow-hidden border border-purple-100 shadow-inner">
        🏪
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-100 group">
        <Image
          src={images[0].url}
          alt={vendorName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )
  }

  return (
    <div className="relative group">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {images.map((img, index) => (
            <CarouselItem key={img.id} className="pl-0">
              <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-100 group">
                <Image
                  src={img.url}
                  alt={`${vendorName} - ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows - Desktop Only */}
        <div className="hidden md:block">
          <CarouselPrevious className="left-6 w-12 h-12 bg-white/80 backdrop-blur-md border-none text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-white" />
          <CarouselNext className="right-6 w-12 h-12 bg-white/80 backdrop-blur-md border-none text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-white" />
        </div>

        {/* Counter Badge */}
        <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 z-10">
           <p className="text-[10px] font-black text-white font-mono tracking-widest">${current} / ${count}</p>
        </div>
      </Carousel>

      {/* Modern Dots Indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-500 pointer-events-auto ${
              current === i + 1
              ? "bg-white w-8 shadow-lg shadow-black/20"
              : "bg-white/40 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
