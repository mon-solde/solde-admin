import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { statusColorMap, vehicleStatuses } from '../data/data'
import { type Vehicle } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

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
    cell: ({ row }) => (
      <div className='flex flex-wrap gap-1'>
        {row.original.participants.map((p) => (
          <span
            key={p.userId}
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
      <DataTableColumnHeader column={column} title='Total investi' />
    ),
    accessorKey: 'totalExpenses',
    cell: ({ row }) => (
      <span className='font-medium'>
        {row.original.totalExpenses.toLocaleString('fr-FR')} €
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
