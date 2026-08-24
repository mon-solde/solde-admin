import { type MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

export type SavingsHistoryEntry = {
  id: string
  sourceType: 'debt' | 'repayment' | 'budget' | 'manual' | 'vehicle_sale'
  date: Date
  label: string
  note?: string
  amount: number
  kind: 'addition' | 'withdrawal'
  source: 'bank' | 'cash'
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

export const savingsMovementKinds: { label: MessageDescriptor; value: string }[] = [
  { label: msg`Ajout`, value: 'addition' },
  { label: msg`Retrait`, value: 'withdrawal' },
]

export const savingsSources: { label: MessageDescriptor; value: string }[] = [
  { label: msg`Banque`, value: 'bank' },
  { label: msg`Espèces`, value: 'cash' },
]

export function formatEuros(amount: number): string {
  return (
    amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €'
  )
}

export function formatFrenchDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getTodayAsInputValue(): string {
  return new Date().toISOString().split('T')[0]
}
