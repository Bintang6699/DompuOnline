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
    default: 'DompuOnline – Dompu Go Digital',
    template: '%s | DompuOnline',
  },
  description:
    'Platform digital lokal Dompu, NTB. Temukan bisnis, kuliner, jasa, transportasi, dan lowongan kerja terpercaya di Dompu.',
  keywords: ['Dompu', 'NTB', 'marketplace', 'UMKM', 'kuliner dompu', 'jasa dompu', 'bisnis dompu'],
  authors: [{ name: 'DompuOnline' }],
  creator: 'DompuOnline',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://dompuonline.id',
    title: 'DompuOnline – Dompu Go Digital',
    description: 'Platform digital lokal Dompu, NTB',
    siteName: 'DompuOnline',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DompuOnline – Dompu Go Digital',
    description: 'Platform digital lokal Dompu, NTB',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo/logo.png',
    apple: '/logo/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#6C3EFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className={`${poppins.className} antialiased`}>{children}</body>
    </html>
  )
}
