import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  FRENCH_MONTHS,
  budgetStatusColorMap,
  budgetStatuses,
  computeBudgetStatus,
  computeSavingsRemaining,
  formatEuros,
} from '../data/data'
import { type MonthlyBudget } from '../data/schema'
import { DataTableRowActions } from './budget-list-data-table-row-actions'

export const budgetListColumns: ColumnDef<MonthlyBudget>[] = [
  {
    id: 'mois',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mois' />
    ),
    accessorFn: (row) => `${row.year}-${String(row.month).padStart(2, '0')}`,
    cell: ({ row }) => (
      <Link
        to='/budget/detail'
        search={{ year: row.original.year, month: row.original.month }}
        className='font-medium hover:underline'
      >
        {FRENCH_MONTHS[row.original.month - 1]} {row.original.year}
      </Link>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'receivedSalary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Salaire reçu' />
    ),
    cell: ({ row }) => <span>{formatEuros(row.original.receivedSalary)}</span>,
  },
  {
    id: 'epargne',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Épargne' />
    ),
    accessorFn: (row) =>
      row.savingsWithdrawals.reduce((sum, w) => sum + w.amount, 0),
    cell: ({ row }) => {
      const total = row.original.savingsWithdrawals.reduce(
        (sum, w) => sum + w.amount,
        0
      )
      const remaining = computeSavingsRemaining(row.original)
      return (
        <div className='flex items-center gap-2'>
          <span>{formatEuros(total)}</span>
          {remaining > 0 && (
            <Badge
              variant='outline'
              className='border-amber-200 bg-amber-50 text-xs font-normal text-amber-600'
            >
              reste {formatEuros(remaining)}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Statut' />
    ),
    accessorFn: (row) => computeBudgetStatus(row),
    cell: ({ row }) => {
      const status = computeBudgetStatus(row.original)
      const label =
        budgetStatuses.find((s) => s.value === status)?.label ?? status
      return (
        <Badge variant='outline' className={cn(budgetStatusColorMap[status])}>
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
