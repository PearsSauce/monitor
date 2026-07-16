export const DEFAULT_CHART_LOCALE = 'zh-CN'

const APP_LOCALE_MAP = {
  zh: 'zh-CN',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  de: 'de-DE'
}

const canonicalLocale = (value) => {
  const raw = String(value || '').trim()
  if (!raw) {
    return ''
  }

  const mapped = APP_LOCALE_MAP[raw.toLowerCase()] || raw.replace(/_/g, '-')
  try {
    const [locale] = Intl.getCanonicalLocales(mapped)
    if (!locale) {
      return ''
    }
    new Intl.NumberFormat(locale).format(1)
    return locale
  } catch {
    return ''
  }
}

export const normalizeChartLocale = (value) => {
  return canonicalLocale(value) || DEFAULT_CHART_LOCALE
}

export const resolveChartLocale = () => {
  const candidates = []

  if (typeof window !== 'undefined') {
    candidates.push(window.localStorage?.getItem('locale'))
  }
  if (typeof navigator !== 'undefined') {
    candidates.push(navigator.language)
    if (Array.isArray(navigator.languages)) {
      candidates.push(...navigator.languages)
    }
  }

  const locale = candidates.map(canonicalLocale).find(Boolean)
  return locale || DEFAULT_CHART_LOCALE
}
