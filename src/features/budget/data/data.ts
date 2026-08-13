import { type MonthlyBudget } from './schema'

export const FRENCH_MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export function formatFrenchDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function formatBillingDay(day: number): string {
  return day === 1 ? 'Le 1er' : `Le ${day}`
}

export const chargeTypeColorMap: Record<'AUTOMATIC' | 'MANUAL', string> = {
  AUTOMATIC: 'text-blue-600 bg-blue-50 border-blue-200',
  MANUAL: 'text-amber-600 bg-amber-50 border-amber-200',
}

export const chargeTypeLabels: Record<'AUTOMATIC' | 'MANUAL', string> = {
  AUTOMATIC: 'Automatique',
  MANUAL: 'Manuel',
}

export function formatEuros(amount: number): string {
  return (
    amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €'
  )
}

export function getTodayAsInputValue(): string {
  return new Date().toISOString().split('T')[0]
}

export function computeAvailableForSavings(budget: MonthlyBudget): number {
  const totalCharges = budget.recurringCharges.reduce(
    (sum, c) => sum + c.amount,
    0
  )
  return budget.receivedSalary - totalCharges
}
