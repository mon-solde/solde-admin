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
import {
  type SavingsHistoryEntry,
  savingsMovementKinds,
  savingsSources,
} from '../data/data'
import { savingsColumns as columns } from './savings-columns'

type SavingsTableProps = Pick<
  UseTableUrlStateReturn,
  | 'pagination'
  | 'onPaginationChange'
  | 'sorting'
  | 'onSortingChange'
  | 'ensurePageInRange'
  | 'globalFilter'
  | 'onGlobalFilterChange'
> & {
  data: SavingsHistoryEntry[]
  rowCount: number
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function SavingsTable({
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
}: SavingsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const kind = (search.kind as string) || 'tous'
  const source = (search.source as string) || 'tous'
  const isFiltered = kind !== 'tous' || source !== 'tous' || Boolean(globalFilter)

  const onKindChange = (value: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        kind: value === 'tous' ? undefined : value,
      }),
    })
  const onSourceChange = (value: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        source: value === 'tous' ? undefined : value,
      }),
    })
  const resetFilters = () => {
    onGlobalFilterChange?.('')
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        kind: undefined,
        source: undefined,
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
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <Input
          placeholder='Filtrer par libellé...'
          value={globalFilter ?? ''}
          onChange={(event) => onGlobalFilterChange?.(event.target.value)}
          className='h-8 w-full sm:w-[250px]'
        />
        <Select value={kind} onValueChange={onKindChange}>
          <SelectTrigger className='h-8 w-[150px]'>
            <SelectValue placeholder='Type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='tous'>Tous les types</SelectItem>
            {savingsMovementKinds.map((k) => (
              <SelectItem key={k.value} value={k.value}>
                {k.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={source} onValueChange={onSourceChange}>
          <SelectTrigger className='h-8 w-[150px]'>
            <SelectValue placeholder='Compte' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='tous'>Tous les comptes</SelectItem>
            {savingsSources.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
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
                      'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
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
                  Aucun mouvement enregistré.
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
