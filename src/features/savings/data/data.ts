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
