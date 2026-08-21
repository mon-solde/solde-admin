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
