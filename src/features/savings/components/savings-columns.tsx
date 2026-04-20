import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  type SavingsHistoryEntry,
  formatEuros,
  formatFrenchDate,
} from '../data/data'
import { DataTableRowActions } from './data-table-row-actions'

export const savingsColumns: ColumnDef<SavingsHistoryEntry>[] = [
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => (
      <span className='text-sm'>{formatFrenchDate(row.getValue('date'))}</span>
    ),
  },
  {
    accessorKey: 'label',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Libellé' />
    ),
    cell: ({ row }) => <span className='text-sm'>{row.getValue('label')}</span>,
    enableSorting: false,
  },
  {
    accessorKey: 'source',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Compte' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline'>
        {row.original.source === 'bank' ? 'Banque' : 'Espèces'}
      </Badge>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'kind',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline'>
        {row.original.kind === 'addition' ? 'Ajout' : 'Retrait'}
      </Badge>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Montant' />
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
          {formatEuros(amount)}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
