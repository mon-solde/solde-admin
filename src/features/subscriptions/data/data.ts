import { CheckCircle2, XCircle, Zap, Hand } from 'lucide-react'
import { msg } from '@lingui/core/macro'
import { type MessageDescriptor } from '@lingui/core'

// Keyed by the real API values — used for the type/status badge cells.
// `label` is a message descriptor, not a resolved string — resolve with
// `i18n._(item.label)` at the point of use to stay reactive to language
// switches (see budget/data/data.ts for the same pattern).
export const subscriptionTypes = [
  { label: msg`Automatique`, value: 'AUTOMATIC' as const, icon: Zap },
  { label: msg`Manuel`, value: 'MANUAL' as const, icon: Hand },
]

export const subscriptionStatuses = [
  { label: msg`Actif`, value: 'active' as const, icon: CheckCircle2 },
  { label: msg`Inactif`, value: 'inactive' as const, icon: XCircle },
]

// Keyed by the French URL filter values (see vehicles' equivalent split) —
// used for the Type/Statut Selects in the table toolbar, distinct from the
// badge-display arrays above.
export const subscriptionTypeFilterOptions: Array<{
  label: MessageDescriptor
  value: 'AUTOMATIC' | 'MANUAL'
}> = [
  { label: msg`Automatique`, value: 'AUTOMATIC' },
  { label: msg`Manuel`, value: 'MANUAL' },
]

export const subscriptionStatusFilterOptions: Array<{
  label: MessageDescriptor
  value: 'en cours' | 'inactif'
}> = [
  { label: msg`En cours`, value: 'en cours' },
  { label: msg`Inactif`, value: 'inactif' },
]

export const typeColorMap: Record<string, string> = {
  AUTOMATIC: 'text-blue-600 bg-blue-50 border-blue-200',
  MANUAL: 'text-amber-600 bg-amber-50 border-amber-200',
}

export const statusColorMap: Record<string, string> = {
  active: 'text-green-600 bg-green-50 border-green-200',
  inactive: 'text-gray-500 bg-gray-50 border-gray-200',
}
