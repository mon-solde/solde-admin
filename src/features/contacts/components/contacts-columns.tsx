import { type ColumnDef } from '@tanstack/react-table'
import { type I18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { formatShortDate } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Contact } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export function getContactsColumns(i18n: I18n): ColumnDef<Contact>[] {
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
      id: 'fullName',
      // TanStack only considers a column sortable (getCanSort()) when it has
      // an accessor — even under manualSorting, where the backend does the
      // actual comparison and this value is never read for that purpose.
      accessorFn: (row) => `${row.firstName} ${row.lastName ?? ''}`.trim(),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Nom`} />
      ),
      cell: ({ getValue }) => (
        <LongText className='max-w-36 ps-3'>{getValue<string>()}</LongText>
      ),
      meta: {
        className: cn(
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
          'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
        ),
      },
      enableHiding: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t`Ajouté le`} />
      ),
      cell: ({ row }) => (
        <div className='text-muted-foreground'>
          {formatShortDate(row.getValue('createdAt'), i18n.locale)}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: DataTableRowActions,
    },
  ]
}
