import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpRight, ArrowDownLeft, Car } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Dette } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

const NOTE_COLUMN_MAX_WIDTH = 'max-w-40 sm:max-w-64'

const fmt = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export const dettesColumns: ColumnDef<Dette>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Direction' />
    ),
    cell: ({ row }) => {
      const role = row.getValue<'lent' | 'borrowed'>('role')
      return role === 'lent' ? (
        <Badge className='gap-1 border border-emerald-200 bg-emerald-100 text-emerald-700 shadow-none hover:bg-emerald-100'>
          <ArrowUpRight size={11} strokeWidth={2.5} />
          Prêt
        </Badge>
      ) : (
        <Badge className='gap-1 border border-rose-200 bg-rose-100 text-rose-600 shadow-none hover:bg-rose-100'>
          <ArrowDownLeft size={11} strokeWidth={2.5} />
          Emprunt
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'personne',
    header: () => <span className='ps-3'>À qui ?</span>,
    accessorFn: (row) =>
      row.role === 'lent' ? row.borrowerName : row.lenderName,
    cell: ({ row, getValue }) => (
      <div className='flex flex-col gap-0.5 ps-3'>
        <Label className='cursor-default font-medium'>
          {getValue<string>()}
        </Label>
        {row.original.type === 'SOLD_VEHICLE' && row.original.vehicleId && (
          <Link
            to='/vehicles/$vehicleId'
            params={{ vehicleId: row.original.vehicleId }}
            className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
          >
            <Car size={11} />
            {row.original.vehicleName ?? 'Véhicule'}
          </Link>
        )}
      </div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Montant initial' />
    ),
    cell: ({ row }) => (
      <Label className='cursor-default font-normal tabular-nums'>
        {fmt.format(row.getValue<number>('amount'))}
      </Label>
    ),
  },
  {
    accessorKey: 'remaining',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Restant dû' />
    ),
    cell: ({ row }) => {
      const remaining = row.getValue<number>('remaining')
      if (remaining === 0)
        return (
          <Label className='cursor-default font-normal text-muted-foreground'>
            —
          </Label>
        )
      return (
        <Label className='cursor-default font-normal tabular-nums'>
          {fmt.format(remaining)}
        </Label>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Note' />
    ),
    cell: ({ row }) => {
      const note = row.getValue<string | undefined>('description')
      if (!note)
        return (
          <Label className='cursor-default font-normal text-muted-foreground'>
            —
          </Label>
        )
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type='button'
              className={cn(
                'block truncate text-start text-sm font-normal text-muted-foreground hover:text-foreground',
                NOTE_COLUMN_MAX_WIDTH
              )}
            >
              {note}
            </button>
          </PopoverTrigger>
          <PopoverContent className='text-sm whitespace-pre-wrap'>
            {note}
          </PopoverContent>
        </Popover>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'isRepaid',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Statut' />
    ),
    cell: ({ row }) => {
      const isRepaid = row.getValue<boolean>('isRepaid')
      return isRepaid ? (
        <Badge className='border border-emerald-200 bg-emerald-100 text-emerald-700 shadow-none hover:bg-emerald-100'>
          Soldé
        </Badge>
      ) : (
        <Badge className='border border-amber-200 bg-amber-100 text-amber-700 shadow-none hover:bg-amber-100'>
          En cours
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => (
      <Label className='cursor-default font-normal text-muted-foreground tabular-nums'>
        {new Intl.DateTimeFormat('fr-FR').format(row.getValue<Date>('date'))}
      </Label>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
