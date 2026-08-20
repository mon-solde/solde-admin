import { useEffect, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import {
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  type NavigateFn,
  type UseTableUrlStateReturn,
} from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { DataTableViewOptions } from '@/components/data-table/view-options'
import {
  subscriptionStatusFilterOptions,
  subscriptionTypeFilterOptions,
} from '../data/data'
import { type Subscription } from '../data/schema'
import { subscriptionsColumns as columns } from './subscriptions-columns'

type SubscriptionsTableProps = Pick<
  UseTableUrlStateReturn,
  | 'pagination'
  | 'onPaginationChange'
  | 'sorting'
  | 'onSortingChange'
  | 'ensurePageInRange'
  | 'globalFilter'
  | 'onGlobalFilterChange'
> & {
  data: Subscription[]
  rowCount: number
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function SubscriptionsTable({
  data,
  rowCount,
  isLoading,
  search,
  navigate,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  ensurePageInRange,
  globalFilter,
  onGlobalFilterChange,
}: SubscriptionsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // What the charge list is filtered by — the backend does the actual
  // filtering, this just reflects/updates the URL. 'en cours' is the
  // default view, not "no filter", so it's only considered a filter once
  // the user picks something else.
  const status = (search.status as string) || 'en cours'
  const type = (search.type as string) || 'tous'
  const isFiltered =
    status !== 'en cours' || type !== 'tous' || Boolean(globalFilter)

  const onStatusChange = (value: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        status: value === 'en cours' ? undefined : value,
      }),
    })
  const onTypeChange = (value: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        type: value === 'tous' ? undefined : value,
      }),
    })
  const resetFilters = () => {
    onGlobalFilterChange?.('')
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        status: undefined,
        type: undefined,
      }),
    })
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange,
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Filtrer par nom...'
            value={globalFilter ?? ''}
            onChange={(event) => onGlobalFilterChange?.(event.target.value)}
            className='h-8 w-full sm:w-[250px]'
          />
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className='h-8 w-[150px]'>
              <SelectValue placeholder='Statut' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='tous'>Tous les statuts</SelectItem>
              {subscriptionStatusFilterOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger className='h-8 w-[150px]'>
              <SelectValue placeholder='Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='tous'>Tous les types</SelectItem>
              {subscriptionTypeFilterOptions.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={resetFilters}
              className='h-8 px-2 lg:px-3'
            >
              Réinitialiser
              <Cross2Icon className='ms-2 h-4 w-4' />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className='h-4 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Aucune charge récurrente trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
