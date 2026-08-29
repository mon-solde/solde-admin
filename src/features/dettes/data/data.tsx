import { msg } from '@lingui/core/macro'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react'

// `label` is a message descriptor, not a resolved string — resolve with
// `i18n._(item.label)` at the point of use to stay reactive to language
// switches (see budget/data/data.ts for the same pattern).
export const detteTypes = [
  {
    label: msg`J'ai prêté`,
    value: 'prêté' as const,
    icon: ArrowUpRight,
  },
  {
    label: msg`On m'a prêté`,
    value: 'emprunté' as const,
    icon: ArrowDownLeft,
  },
]

export const detteStatuses = [
  {
    label: msg`En cours`,
    value: 'en cours' as const,
    icon: Clock,
  },
  {
    label: msg`Remboursé`,
    value: 'remboursé' as const,
    icon: CheckCircle2,
  },
  {
    label: msg`Pardonné`,
    value: 'pardonné' as const,
    icon: HeartHandshake,
  },
]
