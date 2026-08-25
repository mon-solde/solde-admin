import { msg } from '@lingui/core/macro'
import { type MessageDescriptor } from '@lingui/core'
import { type MonthlyBudget } from './schema'

// Resolve with `i18n._(MONTH_MESSAGES[month - 1])` at the point of use —
// `msg` only captures the message for translation, it doesn't resolve it
// against the active locale (unlike `t`, which needs an active render/call
// context to stay reactive to language switches).
export const MONTH_MESSAGES: MessageDescriptor[] = [
  msg`Janvier`,
  msg`Février`,
  msg`Mars`,
  msg`Avril`,
  msg`Mai`,
  msg`Juin`,
  msg`Juillet`,
  msg`Août`,
  msg`Septembre`,
  msg`Octobre`,
  msg`Novembre`,
  msg`Décembre`,
]

export const chargeTypeColorMap: Record<'AUTOMATIC' | 'MANUAL', string> = {
  AUTOMATIC: 'text-blue-600 bg-blue-50 border-blue-200',
  MANUAL: 'text-amber-600 bg-amber-50 border-amber-200',
}

export const CHARGE_TYPE_MESSAGES: Record<'AUTOMATIC' | 'MANUAL', MessageDescriptor> = {
  AUTOMATIC: msg`Automatique`,
  MANUAL: msg`Manuel`,
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
