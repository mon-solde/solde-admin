import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { statusColorMap, vehicleStatuses } from '../data/data'
import { expenses } from '../data/expenses'
import { type Vehicle } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

function getTotalInvested(vehicleId: string) {
  return expenses
    .filter((e) => e.vehicleId === vehicleId)
    .reduce((sum, e) => sum + e.totalAmount, 0)
}

export const vehiclesColumns: ColumnDef<Vehicle>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Tout sélectionner'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Sélectionner la ligne'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'vehicle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Véhicule' />
    ),
    accessorFn: (row) => `${row.make} ${row.model}`,
    cell: ({ row }) => (
      <Link
        to='/vehicles/$vehicleId'
        params={{ vehicleId: row.original.id }}
        className='font-medium hover:underline'
      >
        {row.original.make} {row.original.model}{' '}
        <span className='font-normal text-muted-foreground'>
          ({row.original.year})
        </span>
      </Link>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Statut' />
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
          {status?.label ?? row.original.status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'participants',
    header: 'Participants',
    cell: ({ row }) => {
      const { participants } = row.original
      return (
        <div className='flex flex-wrap gap-1'>
          {participants.map((p) => (
            <span
              key={p.userId}
              className='inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground'
            >
              {p.userName.split(' ')[0]}
              <span className='ms-1 font-medium text-foreground'>
                {p.profitShare}%
              </span>
            </span>
          ))}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'totalInvested',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total investi' />
    ),
    accessorFn: (row) => getTotalInvested(row.id),
    cell: ({ row }) => {
      const total = getTotalInvested(row.original.id)
      return (
        <span className='font-medium'>{total.toLocaleString('fr-FR')} €</span>
      )
    },
  },
  {
    id: 'salePrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Prix de vente' />
    ),
    accessorFn: (row) => row.salePrice ?? 0,
    cell: ({ row }) => {
      const { salePrice, status } = row.original
      if (status !== 'sold' || !salePrice) {
        return <span className='text-muted-foreground'>—</span>
      }
      return (
        <span className='font-medium text-green-600'>
          {salePrice.toLocaleString('fr-FR')} €
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
