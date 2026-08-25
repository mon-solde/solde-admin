import { i18n } from '@lingui/core'
import { getCookie, setCookie } from '@/lib/cookies'

const LOCALE_COOKIE_NAME = 'locale'
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

// Same cookie-based persistence as theme/layout/direction/font (see
// context/theme-provider.tsx) — kept here rather than a provider since the
// initial locale must load before the app renders (see main.tsx).
export function getStoredLocale(): string | undefined {
  return getCookie(LOCALE_COOKIE_NAME)
}

/**
 * Load messages for requested locale and activate it.
 * This function isn't part of the LinguiJS library because there are
 * many ways how to load messages — from REST API, from file, from cache, etc.
 */
export async function loadCatalog(locale: string) {
  const { messages } = await import(`./locales/${locale}.po`)
  i18n.loadAndActivate({ locale, messages })
  setCookie(LOCALE_COOKIE_NAME, locale, LOCALE_COOKIE_MAX_AGE)
}
