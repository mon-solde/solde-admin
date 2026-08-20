import { CheckCircle2, XCircle, Zap, Hand } from 'lucide-react'

// Keyed by the real API values — used for the type/status badge cells.
export const subscriptionTypes = [
  { label: 'Automatique', value: 'AUTOMATIC' as const, icon: Zap },
  { label: 'Manuel', value: 'MANUAL' as const, icon: Hand },
]

export const subscriptionStatuses = [
  { label: 'Actif', value: 'active' as const, icon: CheckCircle2 },
  { label: 'Inactif', value: 'inactive' as const, icon: XCircle },
]

// Keyed by the French URL filter values (see vehicles' equivalent split) —
// used for the Type/Statut Selects in the table toolbar, distinct from the
// badge-display arrays above.
export const subscriptionTypeFilterOptions = [
  { label: 'Automatique', value: 'AUTOMATIC' as const },
  { label: 'Manuel', value: 'MANUAL' as const },
]

export const subscriptionStatusFilterOptions = [
  { label: 'En cours', value: 'en cours' as const },
  { label: 'Inactif', value: 'inactif' as const },
]

export const typeColorMap: Record<string, string> = {
  AUTOMATIC: 'text-blue-600 bg-blue-50 border-blue-200',
  MANUAL: 'text-amber-600 bg-amber-50 border-amber-200',
}

export const statusColorMap: Record<string, string> = {
  active: 'text-green-600 bg-green-50 border-green-200',
  inactive: 'text-gray-500 bg-gray-50 border-gray-200',
}

export function formatBillingDay(day: number) {
  if (day === 1) return 'Le 1er'
  return `Le ${day}`
}

export function formatAmountInEuros(amount: number) {
  return (
    amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €'
  )
}
