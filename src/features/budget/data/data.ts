import { type ActionPayment, type MonthlyBudget } from './schema'

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

export function calculateTotalPaid(payments: ActionPayment[]): number {
  return payments.reduce((sum, p) => sum + p.amount, 0)
}

export function resolveActionState(
  totalPaid: number,
  plannedAmount: number
): 'pending' | 'partial' | 'done' {
  if (totalPaid === 0) return 'pending'
  if (totalPaid < plannedAmount) return 'partial'
  return 'done'
}

export function formatFrenchDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
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

export type BudgetStatus = 'done' | 'in-progress' | 'pending'

export const budgetStatuses = [
  { label: 'Terminé', value: 'done' },
  { label: 'En cours', value: 'in-progress' },
  { label: 'Non débuté', value: 'pending' },
]

export const budgetStatusColorMap: Record<BudgetStatus, string> = {
  done: 'text-green-600 border-green-200 bg-green-50',
  'in-progress': 'text-amber-600 border-amber-200 bg-amber-50',
  pending: 'text-muted-foreground',
}

export function computeAvailableForSavings(budget: MonthlyBudget): number {
  const totalCharges =
    budget.automaticDeductions.reduce((sum, d) => sum + d.amount, 0) +
    budget.manualActions.reduce((sum, a) => sum + a.plannedAmount, 0)
  return budget.receivedSalary - totalCharges
}

export function computeBudgetStatus(budget: MonthlyBudget): BudgetStatus {
  const { manualActions } = budget
  if (manualActions.length === 0) return 'pending'
  const states = manualActions.map((action) => {
    const totalPaid = calculateTotalPaid(action.payments)
    return resolveActionState(totalPaid, action.plannedAmount)
  })
  if (states.every((s) => s === 'done')) return 'done'
  if (states.some((s) => s !== 'pending')) return 'in-progress'
  return 'pending'
}
