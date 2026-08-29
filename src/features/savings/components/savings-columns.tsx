import { type ColumnDef } from '@tanstack/react-table'
import { type I18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { formatDayMonthYear } from '@/lib/dates'
import { centsToEuros, formatEuros } from '@/lib/money'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  type SavingsHistoryEntry,
  savingsMovementKinds,
  savingsSources,
} from '../data/data'
import { DataTableRowActions } from './data-table-row-actions'

export function getSavingsColumns(
  i18n: I18n
): ColumnDef<SavingsHistoryEntry>[] {
  return [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Date`} />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {formatDayMonthYear(row.getValue('date'), i18n.locale)}
        </span>
      ),
    },
    {
      accessorKey: 'label',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Libellé`} />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='text-sm'>{row.getValue('label')}</span>
          {row.original.note && (
            <span className='text-xs text-muted-foreground'>
              {row.original.note}
            </span>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'source',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Compte`} />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>
          {i18n._(
            savingsSources.find((s) => s.value === row.original.source)!.label
          )}
        </Badge>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'kind',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Type`} />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>
          {i18n._(
            savingsMovementKinds.find((k) => k.value === row.original.kind)!
              .label
          )}
        </Badge>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Montant`} />
      ),
      cell: ({ row }) => {
        const { kind, amount } = row.original
        return (
          <span
            className={cn(
              'font-semibold',
              kind === 'addition' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {kind === 'addition' ? '+' : '-'}
            {formatEuros(centsToEuros(amount), i18n.locale)}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ]
}
