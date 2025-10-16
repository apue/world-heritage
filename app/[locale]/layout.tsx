import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { languages, type Locale, isRTL } from '@/lib/i18n/config'
import { UserSitesProvider } from '@/lib/contexts/UserSitesContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'World Heritage Explorer | Discover 1,247 UNESCO Sites Worldwide',
  description:
    'Your all-in-one hub for exploring UNESCO World Heritage Sites. Search, filter, and plan visits to 1,247+ cultural, natural, and mixed heritage sites across the globe. Interactive map, travel planning tools, and educational games.',
  keywords: [
    'UNESCO',
    'World Heritage Sites',
    'Travel Planning',
    'Cultural Heritage',
    'Natural Heritage',
    'Heritage Tourism',
    'Interactive Map',
    'World Heritage List',
    'UNESCO Sites',
    'Heritage Explorer',
  ],
  authors: [{ name: 'World Heritage Explorer' }],
  openGraph: {
    title: 'World Heritage Explorer | Discover UNESCO Sites',
    description: 'Explore 1,247+ UNESCO World Heritage Sites with interactive map and filters',
    type: 'website',
    locale: 'en_US',
    siteName: 'World Heritage Explorer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Heritage Explorer',
    description: 'Discover and explore UNESCO World Heritage Sites worldwide',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://world-heritage.vercel.app',
    languages: {
      en: 'https://world-heritage.vercel.app/en',
      zh: 'https://world-heritage.vercel.app/zh',
    },
  },
}

// Generate static params for all locales
export async function generateStaticParams() {
  return languages.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale: rawLocale } = await params
  const locale = rawLocale as Locale

  return (
    <html lang={locale} dir={isRTL(locale) ? 'rtl' : 'ltr'}>
      <body className={inter.className}>
        <UserSitesProvider>{children}</UserSitesProvider>
      </body>
    </html>
  )
}
