/**
 * Country code to name mappings
 * Supports English and Chinese
 */

import { Locale } from '@/lib/i18n/config'

// ISO 3166-1 alpha-2 to country name mapping
const countryNames: Record<string, { en: string; zh: string }> = {
  af: { en: 'Afghanistan', zh: '阿富汗' },
  al: { en: 'Albania', zh: '阿尔巴尼亚' },
  dz: { en: 'Algeria', zh: '阿尔及利亚' },
  ad: { en: 'Andorra', zh: '安道尔' },
  ao: { en: 'Angola', zh: '安哥拉' },
  ag: { en: 'Antigua and Barbuda', zh: '安提瓜和巴布达' },
  ar: { en: 'Argentina', zh: '阿根廷' },
  am: { en: 'Armenia', zh: '亚美尼亚' },
  au: { en: 'Australia', zh: '澳大利亚' },
  at: { en: 'Austria', zh: '奥地利' },
  az: { en: 'Azerbaijan', zh: '阿塞拜疆' },
  bs: { en: 'Bahamas', zh: '巴哈马' },
  bh: { en: 'Bahrain', zh: '巴林' },
  bd: { en: 'Bangladesh', zh: '孟加拉国' },
  bb: { en: 'Barbados', zh: '巴巴多斯' },
  by: { en: 'Belarus', zh: '白俄罗斯' },
  be: { en: 'Belgium', zh: '比利时' },
  bz: { en: 'Belize', zh: '伯利兹' },
  bj: { en: 'Benin', zh: '贝宁' },
  bt: { en: 'Bhutan', zh: '不丹' },
  bo: { en: 'Bolivia', zh: '玻利维亚' },
  ba: { en: 'Bosnia and Herzegovina', zh: '波斯尼亚和黑塞哥维那' },
  bw: { en: 'Botswana', zh: '博茨瓦纳' },
  br: { en: 'Brazil', zh: '巴西' },
  bn: { en: 'Brunei', zh: '文莱' },
  bg: { en: 'Bulgaria', zh: '保加利亚' },
  bf: { en: 'Burkina Faso', zh: '布基纳法索' },
  bi: { en: 'Burundi', zh: '布隆迪' },
  kh: { en: 'Cambodia', zh: '柬埔寨' },
  cm: { en: 'Cameroon', zh: '喀麦隆' },
  ca: { en: 'Canada', zh: '加拿大' },
  cv: { en: 'Cape Verde', zh: '佛得角' },
  cf: { en: 'Central African Republic', zh: '中非共和国' },
  td: { en: 'Chad', zh: '乍得' },
  cl: { en: 'Chile', zh: '智利' },
  cn: { en: 'China', zh: '中国' },
  co: { en: 'Colombia', zh: '哥伦比亚' },
  cg: { en: 'Congo', zh: '刚果' },
  cd: { en: 'Democratic Republic of the Congo', zh: '刚果民主共和国' },
  cr: { en: 'Costa Rica', zh: '哥斯达黎加' },
  ci: { en: "Côte d'Ivoire", zh: '科特迪瓦' },
  hr: { en: 'Croatia', zh: '克罗地亚' },
  cu: { en: 'Cuba', zh: '古巴' },
  cy: { en: 'Cyprus', zh: '塞浦路斯' },
  cz: { en: 'Czech Republic', zh: '捷克' },
  dk: { en: 'Denmark', zh: '丹麦' },
  dj: { en: 'Djibouti', zh: '吉布提' },
  dm: { en: 'Dominica', zh: '多米尼克' },
  do: { en: 'Dominican Republic', zh: '多米尼加' },
  ec: { en: 'Ecuador', zh: '厄瓜多尔' },
  eg: { en: 'Egypt', zh: '埃及' },
  sv: { en: 'El Salvador', zh: '萨尔瓦多' },
  gq: { en: 'Equatorial Guinea', zh: '赤道几内亚' },
  er: { en: 'Eritrea', zh: '厄立特里亚' },
  ee: { en: 'Estonia', zh: '爱沙尼亚' },
  et: { en: 'Ethiopia', zh: '埃塞俄比亚' },
  fj: { en: 'Fiji', zh: '斐济' },
  fi: { en: 'Finland', zh: '芬兰' },
  fr: { en: 'France', zh: '法国' },
  ga: { en: 'Gabon', zh: '加蓬' },
  gm: { en: 'Gambia', zh: '冈比亚' },
  ge: { en: 'Georgia', zh: '格鲁吉亚' },
  de: { en: 'Germany', zh: '德国' },
  gh: { en: 'Ghana', zh: '加纳' },
  gr: { en: 'Greece', zh: '希腊' },
  gd: { en: 'Grenada', zh: '格林纳达' },
  gt: { en: 'Guatemala', zh: '危地马拉' },
  gn: { en: 'Guinea', zh: '几内亚' },
  gw: { en: 'Guinea-Bissau', zh: '几内亚比绍' },
  gy: { en: 'Guyana', zh: '圭亚那' },
  ht: { en: 'Haiti', zh: '海地' },
  va: { en: 'Holy See', zh: '梵蒂冈' },
  hn: { en: 'Honduras', zh: '洪都拉斯' },
  hu: { en: 'Hungary', zh: '匈牙利' },
  is: { en: 'Iceland', zh: '冰岛' },
  in: { en: 'India', zh: '印度' },
  id: { en: 'Indonesia', zh: '印度尼西亚' },
  ir: { en: 'Iran', zh: '伊朗' },
  iq: { en: 'Iraq', zh: '伊拉克' },
  ie: { en: 'Ireland', zh: '爱尔兰' },
  il: { en: 'Israel', zh: '以色列' },
  it: { en: 'Italy', zh: '意大利' },
  jm: { en: 'Jamaica', zh: '牙买加' },
  jp: { en: 'Japan', zh: '日本' },
  jo: { en: 'Jordan', zh: '约旦' },
  kz: { en: 'Kazakhstan', zh: '哈萨克斯坦' },
  ke: { en: 'Kenya', zh: '肯尼亚' },
  ki: { en: 'Kiribati', zh: '基里巴斯' },
  kp: { en: 'North Korea', zh: '朝鲜' },
  kr: { en: 'South Korea', zh: '韩国' },
  kw: { en: 'Kuwait', zh: '科威特' },
  kg: { en: 'Kyrgyzstan', zh: '吉尔吉斯斯坦' },
  la: { en: 'Laos', zh: '老挝' },
  lv: { en: 'Latvia', zh: '拉脱维亚' },
  lb: { en: 'Lebanon', zh: '黎巴嫩' },
  ls: { en: 'Lesotho', zh: '莱索托' },
  lr: { en: 'Liberia', zh: '利比里亚' },
  ly: { en: 'Libya', zh: '利比亚' },
  li: { en: 'Liechtenstein', zh: '列支敦士登' },
  lt: { en: 'Lithuania', zh: '立陶宛' },
  lu: { en: 'Luxembourg', zh: '卢森堡' },
  mk: { en: 'North Macedonia', zh: '北马其顿' },
  mg: { en: 'Madagascar', zh: '马达加斯加' },
  mw: { en: 'Malawi', zh: '马拉维' },
  my: { en: 'Malaysia', zh: '马来西亚' },
  mv: { en: 'Maldives', zh: '马尔代夫' },
  ml: { en: 'Mali', zh: '马里' },
  mt: { en: 'Malta', zh: '马耳他' },
  mh: { en: 'Marshall Islands', zh: '马绍尔群岛' },
  mr: { en: 'Mauritania', zh: '毛里塔尼亚' },
  mu: { en: 'Mauritius', zh: '毛里求斯' },
  mx: { en: 'Mexico', zh: '墨西哥' },
  fm: { en: 'Micronesia', zh: '密克罗尼西亚' },
  md: { en: 'Moldova', zh: '摩尔多瓦' },
  mc: { en: 'Monaco', zh: '摩纳哥' },
  mn: { en: 'Mongolia', zh: '蒙古' },
  me: { en: 'Montenegro', zh: '黑山' },
  ma: { en: 'Morocco', zh: '摩洛哥' },
  mz: { en: 'Mozambique', zh: '莫桑比克' },
  mm: { en: 'Myanmar', zh: '缅甸' },
  na: { en: 'Namibia', zh: '纳米比亚' },
  nr: { en: 'Nauru', zh: '瑙鲁' },
  np: { en: 'Nepal', zh: '尼泊尔' },
  nl: { en: 'Netherlands', zh: '荷兰' },
  nz: { en: 'New Zealand', zh: '新西兰' },
  ni: { en: 'Nicaragua', zh: '尼加拉瓜' },
  ne: { en: 'Niger', zh: '尼日尔' },
  ng: { en: 'Nigeria', zh: '尼日利亚' },
  no: { en: 'Norway', zh: '挪威' },
  om: { en: 'Oman', zh: '阿曼' },
  pk: { en: 'Pakistan', zh: '巴基斯坦' },
  pw: { en: 'Palau', zh: '帕劳' },
  ps: { en: 'Palestine', zh: '巴勒斯坦' },
  pa: { en: 'Panama', zh: '巴拿马' },
  pg: { en: 'Papua New Guinea', zh: '巴布亚新几内亚' },
  py: { en: 'Paraguay', zh: '巴拉圭' },
  pe: { en: 'Peru', zh: '秘鲁' },
  ph: { en: 'Philippines', zh: '菲律宾' },
  pl: { en: 'Poland', zh: '波兰' },
  pt: { en: 'Portugal', zh: '葡萄牙' },
  qa: { en: 'Qatar', zh: '卡塔尔' },
  ro: { en: 'Romania', zh: '罗马尼亚' },
  ru: { en: 'Russia', zh: '俄罗斯' },
  rw: { en: 'Rwanda', zh: '卢旺达' },
  kn: { en: 'Saint Kitts and Nevis', zh: '圣基茨和尼维斯' },
  lc: { en: 'Saint Lucia', zh: '圣卢西亚' },
  vc: { en: 'Saint Vincent and the Grenadines', zh: '圣文森特和格林纳丁斯' },
  ws: { en: 'Samoa', zh: '萨摩亚' },
  sm: { en: 'San Marino', zh: '圣马力诺' },
  st: { en: 'São Tomé and Príncipe', zh: '圣多美和普林西比' },
  sa: { en: 'Saudi Arabia', zh: '沙特阿拉伯' },
  sn: { en: 'Senegal', zh: '塞内加尔' },
  rs: { en: 'Serbia', zh: '塞尔维亚' },
  sc: { en: 'Seychelles', zh: '塞舌尔' },
  sl: { en: 'Sierra Leone', zh: '塞拉利昂' },
  sg: { en: 'Singapore', zh: '新加坡' },
  sk: { en: 'Slovakia', zh: '斯洛伐克' },
  si: { en: 'Slovenia', zh: '斯洛文尼亚' },
  sb: { en: 'Solomon Islands', zh: '所罗门群岛' },
  so: { en: 'Somalia', zh: '索马里' },
  za: { en: 'South Africa', zh: '南非' },
  ss: { en: 'South Sudan', zh: '南苏丹' },
  es: { en: 'Spain', zh: '西班牙' },
  lk: { en: 'Sri Lanka', zh: '斯里兰卡' },
  sd: { en: 'Sudan', zh: '苏丹' },
  sr: { en: 'Suriname', zh: '苏里南' },
  sz: { en: 'Eswatini', zh: '斯威士兰' },
  se: { en: 'Sweden', zh: '瑞典' },
  ch: { en: 'Switzerland', zh: '瑞士' },
  sy: { en: 'Syria', zh: '叙利亚' },
  tj: { en: 'Tajikistan', zh: '塔吉克斯坦' },
  tz: { en: 'Tanzania', zh: '坦桑尼亚' },
  th: { en: 'Thailand', zh: '泰国' },
  tl: { en: 'Timor-Leste', zh: '东帝汶' },
  tg: { en: 'Togo', zh: '多哥' },
  to: { en: 'Tonga', zh: '汤加' },
  tt: { en: 'Trinidad and Tobago', zh: '特立尼达和多巴哥' },
  tn: { en: 'Tunisia', zh: '突尼斯' },
  tr: { en: 'Turkey', zh: '土耳其' },
  tm: { en: 'Turkmenistan', zh: '土库曼斯坦' },
  tv: { en: 'Tuvalu', zh: '图瓦卢' },
  ug: { en: 'Uganda', zh: '乌干达' },
  ua: { en: 'Ukraine', zh: '乌克兰' },
  ae: { en: 'United Arab Emirates', zh: '阿联酋' },
  gb: { en: 'United Kingdom', zh: '英国' },
  us: { en: 'United States', zh: '美国' },
  uy: { en: 'Uruguay', zh: '乌拉圭' },
  uz: { en: 'Uzbekistan', zh: '乌兹别克斯坦' },
  vu: { en: 'Vanuatu', zh: '瓦努阿图' },
  ve: { en: 'Venezuela', zh: '委内瑞拉' },
  vn: { en: 'Vietnam', zh: '越南' },
  ye: { en: 'Yemen', zh: '也门' },
  zm: { en: 'Zambia', zh: '赞比亚' },
  zw: { en: 'Zimbabwe', zh: '津巴布韦' },
}

/**
 * Get country name by ISO code
 */
export function getCountryName(code: string, locale: Locale = 'en'): string {
  const lowerCode = code.toLowerCase()
  const country = countryNames[lowerCode]

  if (!country) {
    // Fallback to uppercase code if not found
    return code.toUpperCase()
  }

  return country[locale] || country.en
}

/**
 * Get all country codes sorted alphabetically by name in given locale
 */
export function getSortedCountryCodes(locale: Locale = 'en'): string[] {
  return Object.keys(countryNames).sort((a, b) => {
    const nameA = getCountryName(a, locale)
    const nameB = getCountryName(b, locale)
    return nameA.localeCompare(nameB, locale === 'zh' ? 'zh-CN' : 'en')
  })
}

/**
 * Search countries by name
 */
export function searchCountries(query: string, locale: Locale = 'en'): string[] {
  if (!query) return getSortedCountryCodes(locale)

  const lowerQuery = query.toLowerCase()

  return Object.keys(countryNames)
    .filter((code) => {
      const name = getCountryName(code, locale).toLowerCase()
      const enName = countryNames[code].en.toLowerCase()
      const zhName = countryNames[code].zh

      // Search in current locale name, English name, and code
      return (
        name.includes(lowerQuery) ||
        enName.includes(lowerQuery) ||
        zhName.includes(lowerQuery) ||
        code.toLowerCase().includes(lowerQuery)
      )
    })
    .sort((a, b) => {
      const nameA = getCountryName(a, locale)
      const nameB = getCountryName(b, locale)
      return nameA.localeCompare(nameB, locale === 'zh' ? 'zh-CN' : 'en')
    })
}
