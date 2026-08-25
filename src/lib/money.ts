import Dinero from 'dinero.js'

export function eur(cents: number): Dinero.Dinero {
  return Dinero({ amount: cents, currency: 'EUR' })
}

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100)
}

export function centsToEuros(cents: number): number {
  return eur(cents).toUnit()
}

// Locale-aware euro display — the amount stays in EUR regardless of
// language (this app's money is always euros), only the symbol position,
// decimal separator, and thousands grouping adapt to the active locale.
export function formatEuros(
  amountInEuros: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    ...options,
  }).format(amountInEuros)
}
