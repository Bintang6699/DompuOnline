export const CATEGORIES = [
  { slug: 'transport', name: 'Transportasi', icon: '🏍️', color: 'from-blue-400 to-blue-600', desc: 'Ojek & Sewa Mobil' },
  { slug: 'food', name: 'Kuliner', icon: '🍽️', color: 'from-orange-400 to-red-500', desc: 'Makanan & Minuman' },
  { slug: 'shopping', name: 'Belanja', icon: '🛍️', color: 'from-pink-400 to-rose-500', desc: 'Produk & Elektronik' },
  { slug: 'services', name: 'Jasa', icon: '🔧', color: 'from-green-400 to-emerald-600', desc: 'Layanan Profesional' },
  { slug: 'jobs', name: 'Loker', icon: '💼', color: 'from-purple-400 to-purple-600', desc: 'Lowongan Kerja' },
  { slug: 'news', name: 'Berita', icon: '📰', color: 'from-cyan-400 to-teal-600', desc: 'Berita Lokal Dompu' },
]

export type CategoryItem = typeof CATEGORIES[number]

