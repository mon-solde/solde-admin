import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  categoryColorMap,
  formatAmountInEuros,
  formatBillingDay,
  paymentTypeColorMap,
  statusColorMap,
  subscriptionCategories,
  subscriptionPaymentTypes,
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
    accessorKey: 'billingDay',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Échéance' />
    ),
    cell: ({ row }) => {
      const { billingDay, paymentType } = row.original
      if (paymentType === 'manual' || !billingDay) {
        return <span className='text-muted-foreground'>—</span>
      }
      return (
        <span className='text-muted-foreground'>
          {formatBillingDay(billingDay)}
        </span>
      )
    },
  },
  {
    accessorKey: 'paymentType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const paymentType = subscriptionPaymentTypes.find(
        (t) => t.value === row.original.paymentType
      )
      return (
        <Badge
          variant='outline'
          className={cn(paymentTypeColorMap[row.original.paymentType])}
        >
          {paymentType?.label ?? row.original.paymentType}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Catégorie' />
    ),
    cell: ({ row }) => {
      const category = subscriptionCategories.find(
        (c) => c.value === row.original.category
      )
      return (
        <Badge
          variant='outline'
          className={cn('capitalize', categoryColorMap[row.original.category])}
        >
          {category?.label ?? row.original.category}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Statut' />
    ),
    cell: ({ row }) => {
      const status = subscriptionStatuses.find(
        (s) => s.value === row.original.status
      )
      return (
        <Badge
          variant='outline'
          className={cn(statusColorMap[row.original.status])}
        >
          {status?.label ?? row.original.status}
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
