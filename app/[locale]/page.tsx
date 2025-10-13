import type { LocalizedPageProps } from '@/lib/i18n/types'
import Link from 'next/link'

const translations = {
  en: {
    title: 'World Heritage Explorer',
    subtitle: 'Discover 1,247 UNESCO World Heritage Sites around the world',
    exploreMap: 'Explore on Map',
    browseSites: 'Browse Sites',
    playGames: 'Play Games',
  },
  zh: {
    title: '世界遗产探索',
    subtitle: '探索全球 1,247 个联合国教科文组织世界遗产',
    exploreMap: '在地图上探索',
    browseSites: '浏览遗产列表',
    playGames: '玩游戏',
  },
}

export default async function Home({ params }: LocalizedPageProps) {
  const { locale: rawLocale } = await params
  const locale = rawLocale as 'en' | 'zh'
  const t = translations[locale]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">{t.title}</h1>
        <p className="text-center text-lg mb-8">{t.subtitle}</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href={`/${locale}/explore`}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors font-semibold shadow-lg"
          >
            🗺️ {t.exploreMap}
          </Link>
          <Link
            href={`/${locale}/heritage`}
            className="rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 transition-colors font-semibold shadow-lg"
          >
            📋 {t.browseSites}
          </Link>
          <Link
            href={`/${locale}/games`}
            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors font-semibold shadow-lg"
          >
            🎮 {t.playGames}
          </Link>
        </div>

        {/* Language Switcher - we'll add a proper component later */}
        <div className="mt-8 text-center text-sm">
          <span className="mr-2">Language:</span>
          <Link href="/en" className="underline hover:text-blue-600 mr-2">
            English
          </Link>
          <span>|</span>
          <Link href="/zh" className="underline hover:text-blue-600 ml-2">
            中文
          </Link>
        </div>
      </div>
    </main>
  )
}
