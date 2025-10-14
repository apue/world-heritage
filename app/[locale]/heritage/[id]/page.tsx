import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSites, getRelatedSites, getSiteById } from '@/lib/data/sites'
import type { HeritageSite } from '@/lib/data/types'
import { languages, defaultLocale, type Locale } from '@/lib/i18n/config'
import type { LocalizedPageProps } from '@/lib/i18n/types'
import ShareActions from '@/components/heritage/ShareActions'
import SiteMiniMap from '@/components/map/SiteMiniMap'

const localeCopy = {
  en: {
    overview: 'Overview',
    quickFacts: 'Quick facts',
    category: 'Category',
    criteria: 'Criteria',
    inscription: 'Inscribed',
    region: 'Region',
    states: 'State Party',
    location: 'Location',
    transboundary: 'Transboundary property',
    singleState: 'Single state property',
    danger: 'Inscribed on the List of World Heritage in Danger',
    goodStanding: 'In good standing',
    officialLink: 'Official UNESCO page',
    mapHeading: 'Site location',
    share: 'Share',
    copy: 'Copy link',
    copied: 'Link copied!',
    relatedHeading: 'Related sites',
    exploreSite: 'View site',
    noRelated: 'No related sites found yet.',
  },
  zh: {
    overview: '遗产简介',
    quickFacts: '关键信息',
    category: '遗产类型',
    criteria: '评选标准',
    inscription: '入选年份',
    region: '所属地区',
    states: '缔约国',
    location: '地理位置',
    transboundary: '跨境遗产',
    singleState: '单一国家遗产',
    danger: '列入《濒危世界遗产名录》',
    goodStanding: '保存状态良好',
    officialLink: '联合国教科文组织官网',
    mapHeading: '遗产地位置',
    share: '分享',
    copy: '复制链接',
    copied: '已复制链接',
    relatedHeading: '相关遗产',
    exploreSite: '查看遗产',
    noRelated: '暂时没有推荐的相关遗产。',
  },
} satisfies Record<Locale, Record<string, string>>

function resolveLocale(rawLocale: string): Locale {
  return languages.includes(rawLocale as Locale) ? (rawLocale as Locale) : defaultLocale
}

function pickTranslation(site: HeritageSite, locale: Locale) {
  return site.translations[locale] ?? site.translations[defaultLocale]
}

export async function generateStaticParams() {
  const sites = getAllSites()
  return languages.flatMap((locale) =>
    sites.map((site) => ({
      locale,
      id: site.id,
    }))
  )
}

export async function generateMetadata({
  params,
}: LocalizedPageProps<{ id: string }>): Promise<Metadata> {
  const { locale: rawLocale, id } = await params
  const locale = resolveLocale(rawLocale)
  const site = getSiteById(id)

  if (!site) {
    return {}
  }

  const translation = pickTranslation(site, locale)
  const description = translation.description
    ? translation.description.slice(0, 160)
    : `Discover ${translation.name} at the World Heritage Explorer.`

  return {
    title: `${translation.name} | World Heritage Explorer`,
    description,
    openGraph: {
      title: `${translation.name} | World Heritage Explorer`,
      description,
      images: site.imageUrl ? [{ url: site.imageUrl }] : undefined,
    },
  }
}

export default async function HeritageDetailPage({ params }: LocalizedPageProps<{ id: string }>) {
  const { locale: rawLocale, id } = await params
  const locale = resolveLocale(rawLocale)
  const site = getSiteById(id)

  if (!site) {
    notFound()
  }

  const translation = pickTranslation(site, locale)
  const copy = localeCopy[locale]
  const relatedSites = getRelatedSites(site.id, 6)

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <section className="relative h-[320px] w-full md:h-[420px]">
        <Image src={site.imageUrl} alt={translation.name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 px-4 py-8 text-white sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-3">
            <span className="inline-flex w-fit items-center rounded-full bg-blue-500/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              {site.category}
            </span>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              {translation.name}
            </h1>
            <p className="max-w-3xl text-sm text-white/80 sm:text-base">{translation.states}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr,1fr] lg:items-start">
          <article className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">{copy.overview}</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">{translation.description}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">{copy.quickFacts}</h2>
              <dl className="mt-4 grid gap-4 rounded-lg bg-white p-6 shadow-sm sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{copy.category}</dt>
                  <dd className="mt-1 text-gray-900">{site.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{copy.criteria}</dt>
                  <dd className="mt-1 text-gray-900">{site.criteriaText || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{copy.inscription}</dt>
                  <dd className="mt-1 text-gray-900">{site.dateInscribed}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{copy.region}</dt>
                  <dd className="mt-1 text-gray-900">{site.region}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">{copy.states}</dt>
                  <dd className="mt-1 text-gray-900">{translation.states}</dd>
                </div>
                {translation.location && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">{copy.location}</dt>
                    <dd className="mt-1 text-gray-900">{translation.location}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                  {site.transboundary ? copy.transboundary : copy.singleState}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    site.danger ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {site.danger ? copy.danger : copy.goodStanding}
                </span>
              </div>
              {site.dangerPeriod && (
                <p className="mt-3 text-sm text-gray-600">{site.dangerPeriod}</p>
              )}
              <Link
                href={site.httpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {copy.officialLink}
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6h8m0 0v8m0-8L5 19" />
                </svg>
              </Link>
            </section>
          </article>

          <aside className="space-y-6">
            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">{copy.mapHeading}</h2>
              <div className="mt-4 h-64 overflow-hidden rounded-lg">
                <SiteMiniMap
                  latitude={site.latitude}
                  longitude={site.longitude}
                  name={translation.name}
                  zoom={site.transboundary ? 5 : 7}
                />
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">{copy.share}</h2>
              <p className="mt-2 text-sm text-gray-600">{translation.name}</p>
              <div className="mt-4">
                <ShareActions
                  title={translation.name}
                  shareLabel={copy.share}
                  copyLabel={copy.copy}
                  copiedLabel={copy.copied}
                />
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">{copy.relatedHeading}</h2>
          {relatedSites.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">{copy.noRelated}</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSites.map((related) => {
                const relatedTranslation = pickTranslation(related, locale)
                return (
                  <Link
                    key={related.id}
                    href={`/${locale}/heritage/${related.id}`}
                    className="group block overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative h-44">
                      <Image
                        src={related.imageUrl}
                        alt={relatedTranslation.name}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {related.category}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-gray-900">
                        {relatedTranslation.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{relatedTranslation.states}</p>
                      <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                        {copy.exploreSite}
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14m-6-6l6 6-6 6"
                          />
                        </svg>
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
