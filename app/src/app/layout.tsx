import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Dompu Online - Dompu Digital & Jualan Online Dompu',
    template: '%s | Dompu Online',
  },
  description:
    'Dompu Online adalah platform dompu digital terpercaya. Pusat jualan online dompu, UMKM, kuliner, jasa, dan lowongan kerja terlengkap di Kabupaten Dompu, NTB.',
  keywords: ['Dompu', 'NTB', 'dompu online', 'jualan online dompu', 'dompu digital', 'marketplace dompu', 'UMKM dompu', 'kuliner dompu', 'jasa dompu', 'bisnis dompu', 'loker dompu', 'berita dompu'],
  authors: [{ name: 'DompuOnline' }],
  creator: 'DompuOnline',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://dompuonline.id',
    title: 'Dompu Online - Dompu Digital & Jualan Online Dompu',
    description: 'Dompu Online adalah platform dompu digital terpercaya. Pusat jualan online dompu, UMKM, kuliner, jasa, dan lowongan kerja.',
    siteName: 'Dompu Online',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dompu Online - Dompu Digital & Jualan Online Dompu',
    description: 'Dompu Online adalah platform dompu digital terpercaya.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo/logo2.png',
    apple: '/logo/logo2.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#6C3EFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

import { PwaFeatures } from '@/components/pwa/PwaFeatures'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className={`${poppins.className} antialiased`}>
        <PwaFeatures />
        {children}
      </body>
    </html>
  )
}
