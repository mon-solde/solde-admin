import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { type I18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { formatShortDate } from '@/lib/dates'
import { centsToEuros, formatEuros } from '@/lib/money'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { statusColorMap, vehicleStatuses } from '../data/data'
import { type Vehicle } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export function getVehiclesColumns(i18n: I18n): ColumnDef<Vehicle>[] {
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
      id: 'vehicle',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Véhicule`} />
      ),
      accessorKey: 'name',
      cell: ({ row }) => (
        <Link
          to='/vehicles/$vehicleId'
          params={{ vehicleId: row.original.id }}
          className='font-medium hover:underline'
        >
          {row.original.name}
        </Link>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Statut`} />
      ),
      cell: ({ row }) => {
        const status = vehicleStatuses.find(
          (s) => s.value === row.original.status
        )
        return (
          <Badge
            variant='outline'
            className={cn('capitalize', statusColorMap[row.original.status])}
          >
            {status ? i18n._(status.label) : row.original.status}
          </Badge>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'purchaseDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Date d'achat`} />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground tabular-nums'>
          {formatShortDate(row.getValue<Date>('purchaseDate'), i18n.locale)}
        </span>
      ),
    },
    {
      id: 'participants',
      header: t`Participants`,
      cell: ({ row }) => (
        <div className='flex flex-wrap gap-1'>
          {row.original.participants.map((p) => (
            <span
              key={p.contactId}
              className='inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground'
            >
              {p.firstName}
              <span className='ms-1 font-medium text-foreground'>
                {p.profitShare}%
              </span>
            </span>
          ))}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'totalInvested',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Total investi`} />
      ),
      accessorKey: 'totalExpenses',
      cell: ({ row }) => (
        <span className='font-medium'>
          {formatEuros(centsToEuros(row.original.totalExpenses), i18n.locale)}
        </span>
      ),
      // Computed by summing every expense payer's amount for the vehicle —
      // not a Prisma column, so the backend can't sort on it.
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ]
}
