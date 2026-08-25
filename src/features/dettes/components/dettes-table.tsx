import { useEffect, useMemo, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import {
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trans, useLingui } from '@lingui/react/macro'
import { cn } from '@/lib/utils'
import {
  type NavigateFn,
  type UseTableUrlStateReturn,
} from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
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
import { ContactCombobox } from '@/features/contacts/components/contact-combobox'
import { useGetVehicles } from '@/features/vehicles/api/vehicles-api'
import { detteTypes, detteStatuses } from '../data/data'
import { type Dette } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { getDettesColumns } from './dettes-columns'

const FILTER_ALL = 'all'

type DataTableProps = Pick<
  UseTableUrlStateReturn,
  'pagination' | 'onPaginationChange' | 'sorting' | 'onSortingChange' | 'ensurePageInRange'
> & {
  data: Dette[]
  rowCount: number
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
  // On when this table is embedded somewhere the vehicle is already fixed
  // by context (a single vehicle's page) — the "Véhicule" filter would be
  // redundant there. Off by default so the main Dettes page is unaffected.
  hideVehicleFilter?: boolean
}

export function DettesTable({
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
  hideVehicleFilter = false,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const { i18n, t } = useLingui()
  const columns = useMemo(() => getDettesColumns(i18n), [i18n])

  // What the debt list is filtered by — the backend does the actual
  // filtering (see useGetDettes), this just reflects/updates the URL.
  // 'en cours' is the default view, not "no filter", so it's only
  // considered a filter once the user picks something else.
  const contactId = (search.contactId as string) || ''
  const type = (search.type as string) || ''
  const status = (search.status as string) || 'en cours'
  const vehicleId = (search.vehicleId as string) || ''
  const isFiltered = Boolean(
    contactId ||
      type ||
      status !== 'en cours' ||
      (!hideVehicleFilter && vehicleId)
  )
  // Not a table — this only needs every vehicle to populate the filter
  // dropdown, so it asks for a generous page size rather than the default.
  const { data: vehiclesPage } = useGetVehicles({
    status: 'tous',
    pageSize: 1000,
  })
  const vehicles = vehiclesPage?.data ?? []

  const onContactIdChange = (id: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        contactId: id || undefined,
      }),
    })
  const onVehicleIdChange = (id: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        vehicleId: id === FILTER_ALL ? undefined : id,
      }),
    })
  const onTypeChange = (value: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        type: value === FILTER_ALL ? undefined : value,
      }),
    })
  const onStatusChange = (value: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        status: value === 'en cours' ? undefined : value,
      }),
    })
  const resetFilters = () =>
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        contactId: undefined,
        type: undefined,
        status: undefined,
        vehicleId: undefined,
      }),
    })

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
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <div className='w-[220px]'>
            <ContactCombobox value={contactId} onChange={onContactIdChange} />
          </div>
          <Select value={type || FILTER_ALL} onValueChange={onTypeChange}>
            <SelectTrigger className='h-8 w-[150px]'>
              <SelectValue placeholder={t`Direction`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL}>
                <Trans>Toutes les directions</Trans>
              </SelectItem>
              {detteTypes.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {i18n._(item.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className='h-8 w-[150px]'>
              <SelectValue placeholder={t`Statut`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='tous'>
                <Trans>Tous les statuts</Trans>
              </SelectItem>
              {detteStatuses.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {i18n._(item.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!hideVehicleFilter && (
            <Select
              value={vehicleId || FILTER_ALL}
              onValueChange={onVehicleIdChange}
            >
              <SelectTrigger className='h-8 w-[180px]'>
                <SelectValue placeholder={t`Véhicule`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FILTER_ALL}>
                  <Trans>Tous les véhicules</Trans>
                </SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={resetFilters}
              className='h-8 px-2 lg:px-3'
            >
              <Trans>Réinitialiser</Trans>
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
                  <Trans>Aucun résultat.</Trans>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  )
}
