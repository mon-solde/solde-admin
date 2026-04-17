import { Car, Phone, Bot, CreditCard, MoreHorizontal, CheckCircle2, PauseCircle, Zap, Hand } from 'lucide-react'

export const subscriptionCategories = [
  { label: 'Auto', value: 'auto' as const, icon: Car },
  { label: 'Télécom', value: 'telecom' as const, icon: Phone },
  { label: 'IA', value: 'ai' as const, icon: Bot },
  { label: 'Banque', value: 'banking' as const, icon: CreditCard },
  { label: 'Autre', value: 'other' as const, icon: MoreHorizontal },
]

export const subscriptionStatuses = [
  { label: 'Actif', value: 'active' as const, icon: CheckCircle2 },
  { label: 'En pause', value: 'paused' as const, icon: PauseCircle },
]

export const categoryColorMap: Record<string, string> = {
  auto: 'text-blue-600 bg-blue-50 border-blue-200',
  telecom: 'text-purple-600 bg-purple-50 border-purple-200',
  ai: 'text-orange-600 bg-orange-50 border-orange-200',
  banking: 'text-green-600 bg-green-50 border-green-200',
  other: 'text-gray-600 bg-gray-50 border-gray-200',
}

export const subscriptionPaymentTypes = [
  { label: 'Automatique', value: 'automatic' as const, icon: Zap },
  { label: 'Manuel', value: 'manual' as const, icon: Hand },
]

export const paymentTypeColorMap: Record<string, string> = {
  automatic: 'text-blue-600 bg-blue-50 border-blue-200',
  manual: 'text-amber-600 bg-amber-50 border-amber-200',
}

export const statusColorMap: Record<string, string> = {
  active: 'text-green-600 bg-green-50 border-green-200',
  paused: 'text-gray-500 bg-gray-50 border-gray-200',
}

export function formatBillingDay(day: number) {
  if (day === 1) return 'Le 1er'
  return `Le ${day}`
}

export function formatAmountInEuros(amount: number) {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}
