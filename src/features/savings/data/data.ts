import { monthlyBudgets } from '@/features/budget/data/monthly-budgets'
import { FRENCH_MONTHS } from '@/features/budget/data/data'
import { type SavingsMovement } from './schema'

export type SavingsHistoryEntry = {
  id: string
  sourceType: 'budget' | 'manual'
  date: Date
  label: string
  amount: number
  kind: 'addition' | 'withdrawal'
  source: 'bank' | 'cash'
}

export function buildSavingsHistory(manualMovements: SavingsMovement[]): SavingsHistoryEntry[] {
  const fromBudget: SavingsHistoryEntry[] = monthlyBudgets.flatMap((budget) =>
    budget.savingsWithdrawals.map((w) => ({
      id: w.id,
      sourceType: 'budget' as const,
      date: w.withdrawalDate,
      label: `Épargne ${FRENCH_MONTHS[budget.month - 1]} ${budget.year}`,
      amount: w.amount,
      kind: 'addition' as const,
      source: w.destination,
    }))
  )

  const fromManual: SavingsHistoryEntry[] = manualMovements.map((m) => ({
    id: m.id,
    sourceType: 'manual' as const,
    date: m.movementDate,
    label: m.label,
    amount: m.amount,
    kind: m.kind,
    source: m.source,
  }))

  return [...fromBudget, ...fromManual].sort((a, b) => b.date.getTime() - a.date.getTime())
}

export function computeSavingsTotals(history: SavingsHistoryEntry[]) {
  let bank = 0
  let cash = 0

  for (const entry of history) {
    const sign = entry.kind === 'addition' ? 1 : -1
    if (entry.source === 'bank') bank += sign * entry.amount
    else cash += sign * entry.amount
  }

  return { bank, cash, total: bank + cash }
}

export const savingsMovementKinds = [
  { label: 'Ajout', value: 'addition' },
  { label: 'Retrait', value: 'withdrawal' },
]

export const savingsSources = [
  { label: 'Banque', value: 'bank' },
  { label: 'Espèces', value: 'cash' },
]

export function formatEuros(amount: number): string {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

export function formatFrenchDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getTodayAsInputValue(): string {
  return new Date().toISOString().split('T')[0]
}
