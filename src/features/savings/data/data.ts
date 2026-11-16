import { type MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

export type SavingsEntryDetails =
  | { type: 'MANUAL'; label: string }
  | { type: 'DEBT'; contactName: string }
  | { type: 'REPAYMENT'; contactName: string; vehicleName?: string }
  | { type: 'BUDGET'; year: number; month: number }
  | { type: 'VEHICLE_EXPENSE'; expenseLabel: string; vehicleName: string }
  | { type: 'VEHICLE_SALE'; vehicleName: string }

export type SavingsHistoryEntry = {
  id: string
  details: SavingsEntryDetails
  date: Date
  note?: string
  amount: number
  kind: 'addition' | 'withdrawal'
  source: 'bank' | 'cash'
}

export const savingsMovementKinds: {
  label: MessageDescriptor
  value: string
}[] = [
  { label: msg`Ajout`, value: 'addition' },
  { label: msg`Retrait`, value: 'withdrawal' },
]

export const savingsSources: { label: MessageDescriptor; value: string }[] = [
  { label: msg`Banque`, value: 'bank' },
  { label: msg`Espèces`, value: 'cash' },
]

export function getTodayAsInputValue(): string {
  return new Date().toISOString().split('T')[0]
}
