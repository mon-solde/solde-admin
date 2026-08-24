import { CheckCircle2, CircleDashed } from 'lucide-react'
import { type MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

// Keyed by the real API status ('ACTIVE'/'SOLD') — used for the status
// badge cell.
export const vehicleStatuses: {
  label: MessageDescriptor
  value: 'ACTIVE' | 'SOLD'
  icon: typeof CircleDashed
}[] = [
  {
    label: msg`En cours`,
    value: 'ACTIVE' as const,
    icon: CircleDashed,
  },
  {
    label: msg`Vendu`,
    value: 'SOLD' as const,
    icon: CheckCircle2,
  },
]

// Keyed by the French URL filter value ('en cours'/'vendu', see
// dettes' detteStatuses for the same pattern) — used for the status Select
// in the table toolbar, distinct from the API status above.
export const vehicleStatusFilterOptions: {
  label: MessageDescriptor
  value: 'en cours' | 'vendu'
}[] = [
  { label: msg`En cours`, value: 'en cours' as const },
  { label: msg`Vendu`, value: 'vendu' as const },
]

export const statusColorMap: Record<string, string> = {
  ACTIVE: 'text-blue-600 bg-blue-50 border-blue-200',
  SOLD: 'text-green-600 bg-green-50 border-green-200',
}
