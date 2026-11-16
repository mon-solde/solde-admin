import { t } from '@lingui/core/macro'
import { formatMonthYear } from '@/lib/dates'
import { type SavingsEntryDetails } from './data'

// The API sends what an entry is about as raw data (never a sentence), so
// the label is composed here, in the user's language.
export function getSavingsEntryLabel(
  details: SavingsEntryDetails,
  locale: string
): string {
  switch (details.type) {
    case 'MANUAL':
      return details.label
    case 'DEBT': {
      const { contactName } = details
      return t`Prêt à ${contactName}`
    }
    case 'REPAYMENT': {
      const { contactName, vehicleName } = details
      return vehicleName
        ? t`Reversement de ${contactName} — ${vehicleName}`
        : t`Remboursement de ${contactName}`
    }
    case 'BUDGET': {
      const month = formatMonthYear(
        new Date(details.year, details.month - 1),
        locale
      )
      return t`Épargne de ${month}`
    }
    case 'VEHICLE_EXPENSE':
      return `${details.expenseLabel} — ${details.vehicleName}`
    case 'VEHICLE_SALE': {
      const { vehicleName } = details
      return t`Vente de ${vehicleName}`
    }
  }
}
