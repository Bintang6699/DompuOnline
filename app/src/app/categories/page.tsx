import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { CATEGORIES } from '@/lib/categories'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Semua Kategori',
  description: 'Jelajahi semua kategori bisnis dan layanan di DompuOnline',
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="max-w-lg mx-auto px-4 pt-5 pb-32">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Semua Kategori</h1>
        <p className="text-sm text-gray-500 mb-6">
          Temukan bisnis dan layanan lokal Dompu sesuai kebutuhanmu
        </p>
        <div className="grid grid-cols-1 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.slug === 'news' ? '/news' : `/categories/${cat.slug}`}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:border-purple-100 hover:shadow-md transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-md shrink-0`}>
                {cat.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-base">{cat.name}</p>
                <p className="text-sm text-gray-400">{cat.desc}</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div> 
  )
}
