import { format } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'

const DATE_FNS_LOCALES: Record<string, typeof fr> = { fr, en: enUS }

function resolveDateFnsLocale(locale: string): typeof fr {
  return DATE_FNS_LOCALES[locale] ?? enUS
}

// Numeric, locale-ordered short date — "21/08/2026" (fr) / "8/21/2026" (en).
export function formatShortDate(date: Date, locale: string): string {
  return format(date, 'P', { locale: resolveDateFnsLocale(locale) })
}

// Day + short month, no year — "21 août" (fr) / "21 Aug" (en). For compact
// rows (e.g. savings/withdrawal history) where the year is implied by context.
export function formatDayMonth(date: Date, locale: string): string {
  return format(date, 'd MMM', { locale: resolveDateFnsLocale(locale) })
}

// Day + short month + year — "21 août 2026" (fr) / "21 Aug 2026" (en).
export function formatDayMonthYear(date: Date, locale: string): string {
  return format(date, 'd MMM yyyy', { locale: resolveDateFnsLocale(locale) })
}

// Weekday + day + long month, no year — "vendredi 21 août" (fr) /
// "Friday 21 August" (en). For expense date group headers.
export function formatWeekdayDayMonth(date: Date, locale: string): string {
  return format(date, 'EEEE d MMMM', { locale: resolveDateFnsLocale(locale) })
}
