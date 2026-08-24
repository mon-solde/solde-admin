import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { ArrowUpRight, ArrowDownLeft, Car } from 'lucide-react'
import { centsToEuros } from '@/lib/money'
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

// A function, not a static array, called via useMemo(() => getDettesColumns(), [i18n])
// in DettesTable — the `i18n` dependency (unused here directly) forces this
// to rebuild on every locale switch, so the `t` calls inside re-run instead
// of staying frozen from whenever the array was first built.
export function getDettesColumns(): ColumnDef<Dette>[] {
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
      meta: {
        className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
      },
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
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Direction`} />
      ),
      cell: ({ row }) => {
        const role = row.getValue<'lent' | 'borrowed'>('role')
        return role === 'lent' ? (
          <Badge className='gap-1 border border-emerald-200 bg-emerald-100 text-emerald-700 shadow-none hover:bg-emerald-100'>
            <ArrowUpRight size={11} strokeWidth={2.5} />
            <Trans>Prêt</Trans>
          </Badge>
        ) : (
          <Badge className='gap-1 border border-rose-200 bg-rose-100 text-rose-600 shadow-none hover:bg-rose-100'>
            <ArrowDownLeft size={11} strokeWidth={2.5} />
            <Trans>Emprunt</Trans>
          </Badge>
        )
      },
      enableSorting: false,
    },
    {
      id: 'personne',
      header: () => (
        <span className='ps-3'>
          <Trans>À qui ?</Trans>
        </span>
      ),
      accessorFn: (row) =>
        row.role === 'lent' ? row.borrowerName : row.lenderName,
      cell: ({ row, getValue }) => (
        <div className='flex flex-col gap-0.5 ps-3'>
          <Label className='cursor-default font-medium'>
            {getValue<string>()}
          </Label>
          {(row.original.type === 'SOLD_VEHICLE' ||
            row.original.type === 'EXPENSE') &&
            row.original.vehicleId && (
              <Link
                to='/vehicles/$vehicleId'
                params={{ vehicleId: row.original.vehicleId }}
                className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
              >
                <Car size={11} />
                {row.original.vehicleName ?? t`Véhicule`}
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
        <DataTableColumnHeader column={column} title={t`Montant initial`} />
      ),
      cell: ({ row }) => (
        <Label className='cursor-default font-normal tabular-nums'>
          {fmt.format(centsToEuros(row.getValue<number>('amount')))}
        </Label>
      ),
    },
    {
      accessorKey: 'remaining',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Restant dû`} />
      ),
      // Computed in memory from repayments, not a DB column — the backend
      // can't sort on it (see find-debts.query-handler.ts).
      enableSorting: false,
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
            {fmt.format(centsToEuros(remaining))}
          </Label>
        )
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Note`} />
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
        <DataTableColumnHeader column={column} title={t`Statut`} />
      ),
      cell: ({ row }) => {
        const isRepaid = row.getValue<boolean>('isRepaid')
        // Forgiveness takes priority — it's a distinct, deliberate status,
        // not to be shown as an ordinary "Soldé" even if the numbers happen
        // to line up.
        if (row.original.isForgiven)
          return (
            <Badge className='border border-sky-200 bg-sky-100 text-sky-700 shadow-none hover:bg-sky-100'>
              <Trans>Pardonné</Trans>
            </Badge>
          )
        return isRepaid ? (
          <Badge className='border border-emerald-200 bg-emerald-100 text-emerald-700 shadow-none hover:bg-emerald-100'>
            <Trans>Soldé</Trans>
          </Badge>
        ) : (
          <Badge className='border border-amber-200 bg-amber-100 text-amber-700 shadow-none hover:bg-amber-100'>
            <Trans>En cours</Trans>
          </Badge>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Date`} />
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
}
