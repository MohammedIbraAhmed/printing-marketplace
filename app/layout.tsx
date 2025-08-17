import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'PrintMarket - Educational Content Printing Marketplace',
    template: '%s | PrintMarket'
  },
  description: 'Connect students, content creators, and print shops for fast, local educational material printing. Same-day printing, quality guaranteed.',
  keywords: [
    'educational printing',
    'student printing',
    'same day printing',
    'local print shops',
    'educational content',
    'print marketplace',
    'campus printing',
    'educational materials'
  ],
  authors: [{ name: 'PrintMarket Team' }],
  creator: 'PrintMarket',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://printmarket.com',
    title: 'PrintMarket - Educational Content Printing Marketplace',
    description: 'Connect students, content creators, and print shops for fast, local educational material printing. Same-day printing, quality guaranteed.',
    siteName: 'PrintMarket',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrintMarket - Educational Content Printing Marketplace',
    description: 'Connect students, content creators, and print shops for fast, local educational material printing. Same-day printing, quality guaranteed.',
    creator: '@printmarket',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
