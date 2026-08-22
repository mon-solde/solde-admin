import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react'

export const detteTypes = [
  {
    label: "J'ai prêté",
    value: 'prêté' as const,
    icon: ArrowUpRight,
  },
  {
    label: "On m'a prêté",
    value: 'emprunté' as const,
    icon: ArrowDownLeft,
  },
]

export const detteStatuses = [
  {
    label: 'En cours',
    value: 'en cours' as const,
    icon: Clock,
  },
  {
    label: 'Remboursé',
    value: 'remboursé' as const,
    icon: CheckCircle2,
  },
  {
    label: 'Pardonné',
    value: 'pardonné' as const,
    icon: HeartHandshake,
  },
]
