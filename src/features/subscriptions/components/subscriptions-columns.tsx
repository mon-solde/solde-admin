import { type ColumnDef } from '@tanstack/react-table'
import { type I18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { SelectOrdinal, Trans } from '@lingui/react/macro'
import { centsToEuros } from '@/lib/money'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  formatAmountInEuros,
  typeColorMap,
  statusColorMap,
  subscriptionTypes,
  subscriptionStatuses,
} from '../data/data'
import { type Subscription } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

// A function, not a static array, so the column titles/labels are rebuilt
// from the currently active locale every time the table renders — see
// SubscriptionsTable, the only caller, for the reactive `i18n` this needs.
export function getSubscriptionsColumns(i18n: I18n): ColumnDef<Subscription>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t`Tout sélectionner`}
          className='translate-y-[2px]'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t`Sélectionner la ligne`}
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Nom`} />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.name}</span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Montant / mois`} />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>
          {formatAmountInEuros(centsToEuros(row.original.amount))}
        </span>
      ),
    },
    {
      accessorKey: 'dueDay',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Échéance`} />
      ),
      cell: ({ row }) => {
        const { dueDay, type } = row.original
        if (type === 'MANUAL' || !dueDay) {
          return <span className='text-muted-foreground'>—</span>
        }
        return (
          <span className='text-muted-foreground'>
            <Trans>
              Le <SelectOrdinal value={dueDay} one='#er' other='#' />
            </Trans>
          </span>
        )
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Type`} />
      ),
      cell: ({ row }) => {
        const typeItem = subscriptionTypes.find(
          (item) => item.value === row.original.type
        )
        return (
          <Badge
            variant='outline'
            className={cn(typeColorMap[row.original.type])}
          >
            {typeItem ? i18n._(typeItem.label) : row.original.type}
          </Badge>
        )
      },
    },
    {
      id: 'status',
      accessorFn: (row) => (row.isActive ? 'active' : 'inactive'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Statut`} />
      ),
      cell: ({ row }) => {
        const statusKey = row.original.isActive ? 'active' : 'inactive'
        const statusItem = subscriptionStatuses.find(
          (item) => item.value === statusKey
        )
        return (
          <Badge variant='outline' className={cn(statusColorMap[statusKey])}>
            {statusItem ? i18n._(statusItem.label) : statusKey}
          </Badge>
        )
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ]
}
