import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  formatAmountInEuros,
  formatBillingDay,
  typeColorMap,
  statusColorMap,
  subscriptionTypes,
  subscriptionStatuses,
} from '../data/data'
import { type Subscription } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const subscriptionsColumns: ColumnDef<Subscription>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nom' />
    ),
    cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    enableHiding: false,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Montant / mois' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>
        {formatAmountInEuros(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: 'dueDay',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Échéance' />
    ),
    cell: ({ row }) => {
      const { dueDay, type } = row.original
      if (type === 'MANUAL' || !dueDay) {
        return <span className='text-muted-foreground'>—</span>
      }
      return (
        <span className='text-muted-foreground'>
          {formatBillingDay(dueDay)}
        </span>
      )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const typeItem = subscriptionTypes.find(
        (t) => t.value === row.original.type
      )
      return (
        <Badge
          variant='outline'
          className={cn(typeColorMap[row.original.type])}
        >
          {typeItem?.label ?? row.original.type}
        </Badge>
      )
    },
  },
  {
    id: 'status',
    accessorFn: (row) => (row.isActive ? 'active' : 'inactive'),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Statut' />
    ),
    cell: ({ row }) => {
      const statusKey = row.original.isActive ? 'active' : 'inactive'
      const statusItem = subscriptionStatuses.find((s) => s.value === statusKey)
      return (
        <Badge variant='outline' className={cn(statusColorMap[statusKey])}>
          {statusItem?.label ?? statusKey}
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
