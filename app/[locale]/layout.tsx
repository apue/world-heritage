import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { languages, type Locale, isRTL } from '@/lib/i18n/config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'World Heritage Explorer | UNESCO Heritage Sites',
  description: 'Explore and discover UNESCO World Heritage Sites around the world',
  keywords: ['UNESCO', 'World Heritage', 'Travel', 'Culture', 'History'],
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
