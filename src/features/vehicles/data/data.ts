import { CheckCircle2, CircleDashed } from 'lucide-react'

export const vehicleStatuses = [
  {
    label: 'En cours',
    value: 'ACTIVE' as const,
    icon: CircleDashed,
  },
  {
    label: 'Vendu',
    value: 'SOLD' as const,
    icon: CheckCircle2,
  },
]

export const statusColorMap: Record<string, string> = {
  ACTIVE: 'text-blue-600 bg-blue-50 border-blue-200',
  SOLD: 'text-green-600 bg-green-50 border-green-200',
}
