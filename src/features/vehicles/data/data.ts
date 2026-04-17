import { CheckCircle2, CircleDashed } from 'lucide-react'

export const vehicleStatuses = [
  {
    label: 'En cours',
    value: 'active' as const,
    icon: CircleDashed,
  },
  {
    label: 'Vendu',
    value: 'sold' as const,
    icon: CheckCircle2,
  },
]

export const statusColorMap: Record<string, string> = {
  active: 'text-blue-600 bg-blue-50 border-blue-200',
  sold: 'text-green-600 bg-green-50 border-green-200',
}

// Liste fixe des partenaires (pattern données fixes introduit pour cette feature — données relationnelles)
export const partners = [
  { id: 'partner-1', firstName: 'Alexandre', lastName: 'Dupont' },
  { id: 'partner-2', firstName: 'Thomas', lastName: 'Martin' },
  { id: 'partner-3', firstName: 'Karim', lastName: 'Benzara' },
  { id: 'partner-4', firstName: 'Mehdi', lastName: 'Saïdi' },
]

export function getPartnerFullName(id: string) {
  const p = partners.find((partner) => partner.id === id)
  return p ? `${p.firstName} ${p.lastName}` : id
}
