'use client'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/categories'
import { 
  Car, UtensilsCrossed, ShoppingBag, 
  Wrench, Briefcase, Newspaper, ChevronRight 
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  transport: Car,
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  services: Wrench,
  jobs: Briefcase,
  news: Newspaper,
}

export function CategoryGrid() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Eksplorasi Dompu</h2>
        <Link href="/categories" className="flex items-center text-xs font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors">
          Semua <ChevronRight size={14} />
        </Link>
      </div>
      <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide pb-2 -mx-2 px-2">
        {CATEGORIES.map((cat) => {
          const IconComponent = ICON_MAP[cat.slug] || ShoppingBag
          return (
            <Link
              key={cat.slug}
              href={cat.slug === 'news' ? '/news' : cat.slug === 'jobs' ? '/jobs' : `/categories/${cat.slug}`}
              className="group shrink-0 snap-center w-[22%]"
            >
              <div className="flex flex-col items-center gap-2 transition-all duration-300">
                <div
                  className={`w-12 h-12 rounded-[18px] bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md shadow-purple-100 group-hover:scale-105 transition-transform duration-300`}
                >
                  <IconComponent size={20} strokeWidth={2.5} />
                </div>
                <div className="text-center w-full">
                  <p className="text-[10px] font-bold text-gray-700 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{cat.name}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}


