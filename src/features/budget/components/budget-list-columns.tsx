import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { type I18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { centsToEuros, formatEuros } from '@/lib/money'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { MONTH_MESSAGES, computeAvailableForSavings } from '../data/data'
import { type MonthlyBudget } from '../data/schema'
import { DataTableRowActions } from './budget-list-data-table-row-actions'

// A function, not a static array, so the column titles/labels are rebuilt
// from the currently active locale every time the table renders — see
// BudgetListTable, the only caller, for the reactive `i18n` this needs.
export function getBudgetListColumns(i18n: I18n): ColumnDef<MonthlyBudget>[] {
  return [
    {
      id: 'mois',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Mois`} />
      ),
      accessorFn: (row) => `${row.year}-${String(row.month).padStart(2, '0')}`,
      cell: ({ row }) => (
        <Link
          to='/budget/detail'
          search={{ year: row.original.year, month: row.original.month }}
          className='font-medium hover:underline'
        >
          {i18n._(MONTH_MESSAGES[row.original.month - 1])} {row.original.year}
        </Link>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'receivedSalary',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Salaire reçu`} />
      ),
      cell: ({ row }) => (
        <span>
          {formatEuros(centsToEuros(row.original.receivedSalary), i18n.locale)}
        </span>
      ),
    },
    {
      id: 'disponible',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Dispo épargne`} />
      ),
      accessorFn: (row) => computeAvailableForSavings(row),
      cell: ({ row }) => {
        const available = computeAvailableForSavings(row.original)
        return (
          <span
            className={cn(available >= 0 ? 'text-green-600' : 'text-red-600')}
          >
            {formatEuros(centsToEuros(available), i18n.locale)}
          </span>
        )
      },
      // Computed from receivedSalary minus recurringCharges/savingsWithdrawals
      // sums — not a Prisma column, so the backend can't sort on it.
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ]
}
