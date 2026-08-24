import { useMemo, useState } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { Cross2Icon } from '@radix-ui/react-icons'
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  FileSpreadsheet,
  Pencil,
  PlusIcon,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Plural, Trans, useLingui } from '@lingui/react/macro'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { centsToEuros } from '@/lib/money'
import { cn, formatPersonName } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { useGetDettes } from '@/features/dettes/api/dettes-api'
import { DettesDialogs } from '@/features/dettes/components/dettes-dialogs'
import { DettesProvider } from '@/features/dettes/components/dettes-provider'
import { DettesTable } from '@/features/dettes/components/dettes-table'
import {
  useGetVehicleDetail,
  useDeleteExpense,
  useDeleteVehicleEvent,
} from '../api/vehicles-api'
import { statusColorMap } from '../data/data'
import { type Expense, type VehicleEvent } from '../data/schema'
import { PayersCell } from './components/payers-cell'
import { exportVehicleInvestmentsToExcel } from './lib/export-investments'
import { VehicleDetailDialogs } from './components/vehicle-detail-dialogs'
import {
  VehicleDetailProvider,
  useVehicleDetail,
} from './components/vehicle-detail-provider'

type ExpenseGroup = { dateKey: string; date: Date; expenses: Expense[] }

const route = getRouteApi('/_authenticated/vehicles/$vehicleId')

// Same mapping as features/dettes/index.tsx — the debts table embedded on
// this page is the exact same component, just pre-filtered to this vehicle.
const SORT_COLUMN_TO_API = {
  personne: 'contactName',
  amount: 'amount',
  date: 'date',
} as const

function VehicleDetailContent() {
  const { vehicleId } = route.useParams()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { setOpen, setCurrentExpense, setCurrentVehicleEvent } =
    useVehicleDetail()
  const { t } = useLingui()
  const { data: vehicle, isLoading } = useGetVehicleDetail(vehicleId)
  const {
    pagination: dettesPagination,
    onPaginationChange: onDettesPaginationChange,
    sorting: dettesSorting,
    onSortingChange: onDettesSortingChange,
    ensurePageInRange: ensureDettesPageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    sorting: {
      columnIdToSortBy: SORT_COLUMN_TO_API,
      defaultSortBy: 'date',
      defaultSortOrder: 'desc',
    },
  })
  const dettesActiveSort = dettesSorting[0]
  // Same filters as the Dettes page (contactId/type/status), minus
  // vehicleId which stays fixed to this vehicle — same 'en cours' default
  // too, since status is left undefined until the user picks something.
  const { data: vehicleDettesPage, isLoading: isVehicleDettesLoading } =
    useGetDettes({
      vehicleId,
      contactId: search.contactId,
      type: search.type,
      status: search.status,
      pageIndex: dettesPagination.pageIndex,
      pageSize: dettesPagination.pageSize,
      sortBy: dettesActiveSort
        ? SORT_COLUMN_TO_API[
            dettesActiveSort.id as keyof typeof SORT_COLUMN_TO_API
          ]
        : undefined,
      sortOrder: dettesActiveSort
        ? dettesActiveSort.desc
          ? 'desc'
          : 'asc'
        : undefined,
    })
  const { mutate: deleteExpense, isPending: isDeletingExpense } =
    useDeleteExpense(vehicleId)
  const { mutate: deleteVehicleEvent, isPending: isDeletingEvent } =
    useDeleteVehicleEvent(vehicleId)
  const [pendingDeleteExpense, setPendingDeleteExpense] =
    useState<Expense | null>(null)
  const [pendingDeleteEvent, setPendingDeleteEvent] =
    useState<VehicleEvent | null>(null)
  const [expenseSearch, setExpenseSearch] = useState('')
  const [payerFilter, setPayerFilter] = useState('all')
  const { auth } = useAuthStore()
  const ownerId = auth.user?.accountNo ?? ''
  // role isn't returned by the API — resolved client-side against the
  // current account, same as features/dettes/index.tsx.
  const vehicleDettes = useMemo(
    () =>
      (vehicleDettesPage?.data ?? []).map((d) => ({
        ...d,
        role:
          d.lenderId === ownerId ? ('lent' as const) : ('borrowed' as const),
      })),
    [vehicleDettesPage, ownerId]
  )

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center py-24'>
          <p className='text-muted-foreground'>
            <Trans>Chargement…</Trans>
          </p>
        </div>
      </Main>
    )
  }

  if (!vehicle) {
    return (
      <Main>
        <div className='flex flex-col items-center justify-center gap-4 py-24'>
          <p className='text-muted-foreground'>
            <Trans>Véhicule introuvable.</Trans>
          </p>
          <Button asChild variant='outline'>
            <Link to='/vehicles'>
              <Trans>Retour à la liste</Trans>
            </Link>
          </Button>
        </div>
      </Main>
    )
  }

  const { financialSummary } = vehicle
  const isSold = vehicle.status === 'SOLD'

  const confirmDeleteExpense = () => {
    if (!pendingDeleteExpense) return
    deleteExpense(pendingDeleteExpense.id, {
      onSuccess: () => {
        toast.success(t`Dépense supprimée.`)
        setPendingDeleteExpense(null)
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ?? t`Une erreur est survenue.`
        )
        setPendingDeleteExpense(null)
      },
    })
  }

  const handleEditExpense = (expense: Expense) => {
    setCurrentExpense(expense)
    setOpen('edit-expense')
  }

  const handleEditEvent = (event: VehicleEvent) => {
    setCurrentVehicleEvent(event)
    setOpen('edit-event')
  }

  const confirmDeleteEvent = () => {
    if (!pendingDeleteEvent) return
    deleteVehicleEvent(pendingDeleteEvent.id, {
      onSuccess: () => {
        toast.success(t`Événement supprimé.`)
        setPendingDeleteEvent(null)
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ?? t`Une erreur est survenue.`
        )
        setPendingDeleteEvent(null)
      },
    })
  }

  // Filtered client-side, not through the backend like the vehicles/dettes
  // tables: `vehicle.expenses` is already fetched in full here (no
  // pagination on this list — a single vehicle realistically accumulates
  // a few dozen expenses over its lifetime, never enough to need it), so
  // there's no request to debounce or extra round-trip to save.
  const normalizedSearch = expenseSearch.trim().toLowerCase()
  const filteredExpenses = vehicle.expenses.filter((e) => {
    const matchesSearch =
      !normalizedSearch || e.label.toLowerCase().includes(normalizedSearch)
    // Match on the responsible party (imputedToId ?? payerId), not the raw
    // payer — money someone fronts but delegates isn't really their own
    // payment, it's the delegate's (who already owes it back via a
    // separate debt; see profit-sharing.ts's computeInvestedByResponsibleParty
    // for the same rule on the backend). A multi-payer expense matches as
    // soon as the searched participant is responsible for one of the
    // payments, regardless of the others.
    const matchesPayer =
      payerFilter === 'all' ||
      e.payers.some((p) => (p.imputedToId ?? p.payerId) === payerFilter)
    return matchesSearch && matchesPayer
  })
  const hasActiveFilter = Boolean(normalizedSearch) || payerFilter !== 'all'
  const resetExpenseFilters = () => {
    setExpenseSearch('')
    setPayerFilter('all')
  }

  // `vehicle.expenses` is already sorted by the backend (date desc, then
  // createdAt desc as a same-day tie-break), so consecutive same-day
  // expenses always land in the same group here.
  const expenseGroups: ExpenseGroup[] = []
  for (const expense of filteredExpenses) {
    const dateKey = expense.date.toDateString()
    const lastGroup = expenseGroups[expenseGroups.length - 1]
    if (lastGroup?.dateKey === dateKey) {
      lastGroup.expenses.push(expense)
    } else {
      expenseGroups.push({ dateKey, date: expense.date, expenses: [expense] })
    }
  }

  return (
    <>
      <Header fixed>
        <div className='flex items-center gap-3'>
          <Button asChild variant='ghost' size='icon'>
            <Link to='/vehicles'>
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <Separator orientation='vertical' className='h-5' />
          <div className='flex items-center gap-2'>
            <span className='font-semibold'>{vehicle.name}</span>
            <Badge
              variant='outline'
              className={cn('ms-1', statusColorMap[vehicle.status])}
            >
              {isSold ? (
                <CheckCircle2 size={12} className='me-1' />
              ) : (
                <CircleDashed size={12} className='me-1' />
              )}
              {isSold ? <Trans>Vendu</Trans> : <Trans>En cours</Trans>}
            </Badge>
          </div>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        {/* Cards résumé */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                <Trans>Total investi</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>
                {centsToEuros(financialSummary.totalExpenses).toLocaleString(
                  'fr-FR'
                )}{' '}
                €
              </p>
              <p className='text-xs text-muted-foreground'>
                <Plural
                  value={vehicle.expenses.length}
                  one='# dépense'
                  other='# dépenses'
                />
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                <Trans>Prix de vente</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.soldVehicle ? (
                <>
                  <p className='text-2xl font-bold text-green-600'>
                    {centsToEuros(
                      vehicle.soldVehicle.salePrice
                    ).toLocaleString('fr-FR')}{' '}
                    €
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    <Trans>
                      Vendu le{' '}
                      {vehicle.soldVehicle.soldAt.toLocaleDateString('fr-FR')}
                    </Trans>
                  </p>
                  {(() => {
                    const cashier = vehicle.participants.find(
                      (p) => p.contactId === vehicle.soldVehicle!.cashierId
                    )
                    // No matching contact means the owner cashed it in — a
                    // cashier is always either the owner or one of their
                    // contacts.
                    const cashierName = cashier
                      ? formatPersonName(cashier.firstName, cashier.lastName)
                      : t`Vous`
                    return (
                      <p className='text-xs text-muted-foreground'>
                        <Trans>
                          Encaissé par{' '}
                          <span className='font-medium text-foreground'>
                            {cashierName}
                          </span>
                        </Trans>
                      </p>
                    )
                  })()}
                </>
              ) : (
                <p className='text-2xl font-bold text-muted-foreground'>—</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                <Trans>Bénéfice net</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {financialSummary.profit !== null ? (
                <>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      financialSummary.profit >= 0
                        ? 'text-green-600'
                        : 'text-red-500'
                    )}
                  >
                    {financialSummary.profit >= 0 ? '+' : ''}
                    {centsToEuros(financialSummary.profit).toLocaleString(
                      'fr-FR'
                    )}{' '}
                    €
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    <Trans>Après dépenses et prix d&apos;achat</Trans>
                  </p>
                </>
              ) : (
                <>
                  <p className='text-2xl font-bold text-muted-foreground'>—</p>
                  <p className='text-xs text-muted-foreground'>
                    <Trans>Véhicule en cours</Trans>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                <Trans>Participants</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>
                {vehicle.participants.length + 1}
              </p>
              <p className='text-xs text-muted-foreground'>
                {[t`Vous`, ...vehicle.participants.map((p) => p.firstName)].join(
                  ', '
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Participants / Répartition */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold'>
                {isSold ? (
                  <Trans>Répartition de la vente</Trans>
                ) : (
                  <Trans>Participants</Trans>
                )}
              </h3>
              {!isSold && (
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-1'
                  onClick={() => setOpen('edit-participants')}
                >
                  <Pencil size={14} />
                  <Trans>Modifier</Trans>
                </Button>
              )}
            </div>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Trans>Nom</Trans>
                    </TableHead>
                    <TableHead className='text-end'>
                      <Trans>% bénéf.</Trans>
                    </TableHead>
                    <TableHead className='text-end'>
                      <Trans>Investi</Trans>
                    </TableHead>
                    {isSold && (
                      <TableHead className='text-end'>
                        <Trans>À recevoir</Trans>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className='font-medium'>{t`Vous`}</TableCell>
                    <TableCell className='text-end'>
                      <Badge variant='outline'>
                        {financialSummary.owner.profitShare}%
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      {centsToEuros(
                        financialSummary.owner.totalInvested
                      ).toLocaleString('fr-FR')}{' '}
                      €
                    </TableCell>
                    {isSold && (
                      <TableCell className='text-end font-medium text-green-600'>
                        {financialSummary.owner.amountToReceive !== null
                          ? `${centsToEuros(financialSummary.owner.amountToReceive).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`
                          : '—'}
                      </TableCell>
                    )}
                  </TableRow>
                  {financialSummary.participants.map((p) => (
                    <TableRow key={p.contactId}>
                      <TableCell className='font-medium'>
                        {formatPersonName(p.firstName, p.lastName)}
                      </TableCell>
                      <TableCell className='text-end'>
                        <Badge variant='outline'>{p.profitShare}%</Badge>
                      </TableCell>
                      <TableCell className='text-end'>
                        {centsToEuros(p.totalInvested).toLocaleString('fr-FR')} €
                      </TableCell>
                      {isSold && (
                        <TableCell className='text-end font-medium text-green-600'>
                          {p.amountToReceive !== null
                            ? `${centsToEuros(p.amountToReceive).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`
                            : '—'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Dépenses */}
          <div className='min-w-0 space-y-3 lg:col-span-2'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold'>
                <Trans>Dépenses</Trans>
              </h3>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-1'
                  onClick={() => {
                    void exportVehicleInvestmentsToExcel(vehicle, ownerId)
                  }}
                >
                  <FileSpreadsheet size={14} />
                  <Trans>Exporter Excel</Trans>
                </Button>
                {!isSold && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='gap-1'
                    onClick={() => setOpen('declare-sold')}
                  >
                    <TrendingUp size={14} />
                    <Trans>Déclarer vendu</Trans>
                  </Button>
                )}
                {!isSold && (
                  <Button
                    size='sm'
                    className='gap-1'
                    onClick={() => setOpen('add-expense')}
                  >
                    <PlusIcon size={14} />
                    <Trans>Ajouter</Trans>
                  </Button>
                )}
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Input
                placeholder={t`Filtrer par nom...`}
                value={expenseSearch}
                onChange={(event) => setExpenseSearch(event.target.value)}
                className='h-8 w-full sm:w-[250px]'
              />
              <Select value={payerFilter} onValueChange={setPayerFilter}>
                <SelectTrigger className='h-8 w-full sm:w-[180px]'>
                  <SelectValue placeholder={t`Participant`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>
                    <Trans>Tous les participants</Trans>
                  </SelectItem>
                  <SelectItem value={ownerId}>{t`Vous`}</SelectItem>
                  {vehicle.participants.map((p) => (
                    <SelectItem key={p.contactId} value={p.contactId}>
                      {formatPersonName(p.firstName, p.lastName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilter && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={resetExpenseFilters}
                  className='h-8 px-2 lg:px-3'
                >
                  <Trans>Réinitialiser</Trans>
                  <Cross2Icon className='ms-2 h-4 w-4' />
                </Button>
              )}
            </div>

            {expenseGroups.length > 0 ? (
              <div className='space-y-4'>
                {expenseGroups.map((group) => (
                  <div key={group.dateKey} className='space-y-2'>
                    <p className='text-xs font-semibold text-muted-foreground capitalize'>
                      {group.date.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <div className='space-y-2'>
                      {group.expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className='flex items-start justify-between gap-3 rounded-md border p-3'
                        >
                          <div className='min-w-0 flex-1 space-y-1'>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type='button'
                                  className='line-clamp-2 break-words text-start font-medium hover:text-muted-foreground'
                                >
                                  {expense.label}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className='whitespace-pre-wrap text-sm'>
                                {expense.label}
                              </PopoverContent>
                            </Popover>
                            <PayersCell payers={expense.payers} />
                          </div>
                          <div className='flex shrink-0 items-center gap-1'>
                            <span className='font-medium tabular-nums'>
                              {centsToEuros(expense.totalAmount).toLocaleString('fr-FR')} €
                            </span>
                            {!isSold && (
                              <>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8 text-muted-foreground hover:text-foreground'
                                  onClick={() => handleEditExpense(expense)}
                                >
                                  <Pencil size={14} />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8 text-muted-foreground hover:text-destructive'
                                  onClick={() =>
                                    setPendingDeleteExpense(expense)
                                  }
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='rounded-md border py-12 text-center text-sm text-muted-foreground'>
                {hasActiveFilter ? (
                  <Trans>Aucune dépense ne correspond aux filtres.</Trans>
                ) : (
                  <Trans>Aucune dépense enregistrée.</Trans>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes libres */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold'>
              <Trans>Notes</Trans>
            </h3>
            <Button
              variant='outline'
              size='sm'
              className='gap-1'
              onClick={() => setOpen('add-event')}
            >
              <PlusIcon size={14} />
              <Trans>Ajouter</Trans>
            </Button>
          </div>

          {vehicle.events.length > 0 ? (
            <div className='space-y-2'>
              {vehicle.events.map((event) => (
                <div
                  key={event.id}
                  className='flex items-start justify-between gap-3 rounded-md border p-3'
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type='button'
                        className='min-w-0 flex-1 text-start hover:text-foreground'
                      >
                        <span className='line-clamp-2 block break-words text-sm text-muted-foreground italic'>
                          {event.note}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className='whitespace-pre-wrap text-sm not-italic'>
                      {event.note}
                    </PopoverContent>
                  </Popover>
                  <div className='flex shrink-0 items-center gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-muted-foreground hover:text-foreground'
                      onClick={() => handleEditEvent(event)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-muted-foreground hover:text-destructive'
                      onClick={() => setPendingDeleteEvent(event)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-md border py-8 text-center text-sm text-muted-foreground'>
              <Trans>Aucune note enregistrée.</Trans>
            </div>
          )}
        </div>

        <DettesProvider>
          <div className='space-y-3'>
            <h3 className='font-semibold'>
              <Trans>Dettes liées à ce véhicule</Trans>
            </h3>
            <DettesTable
              data={vehicleDettes}
              rowCount={vehicleDettesPage?.count ?? 0}
              isLoading={isVehicleDettesLoading}
              search={search}
              navigate={navigate}
              pagination={dettesPagination}
              onPaginationChange={onDettesPaginationChange}
              sorting={dettesSorting}
              onSortingChange={onDettesSortingChange}
              ensurePageInRange={ensureDettesPageInRange}
              hideVehicleFilter
            />
          </div>
          <DettesDialogs />
        </DettesProvider>
      </Main>

      <VehicleDetailDialogs vehicle={vehicle} />

      {pendingDeleteExpense && (
        <ConfirmDialog
          open={!!pendingDeleteExpense}
          onOpenChange={(state) => {
            if (!state) setPendingDeleteExpense(null)
          }}
          handleConfirm={confirmDeleteExpense}
          isLoading={isDeletingExpense}
          title={t`Supprimer cette dépense`}
          desc={
            <p>
              <Trans>
                Êtes-vous sûr de vouloir supprimer{' '}
                <span className='font-bold'>
                  {pendingDeleteExpense.label}
                </span>{' '}
                (
                {centsToEuros(
                  pendingDeleteExpense.totalAmount
                ).toLocaleString('fr-FR')}{' '}
                €) ? Cette action est irréversible.
              </Trans>
            </p>
          }
          confirmText={t`Supprimer`}
          destructive
        />
      )}

      {pendingDeleteEvent && (
        <ConfirmDialog
          open={!!pendingDeleteEvent}
          onOpenChange={(state) => {
            if (!state) setPendingDeleteEvent(null)
          }}
          handleConfirm={confirmDeleteEvent}
          isLoading={isDeletingEvent}
          title={t`Supprimer cet événement`}
          desc={
            <p>
              <Trans>
                Êtes-vous sûr de vouloir supprimer cette note ? Cette action
                est irréversible.
              </Trans>
            </p>
          }
          confirmText={t`Supprimer`}
          destructive
        />
      )}
    </>
  )
}

export function VehicleDetail() {
  return (
    <VehicleDetailProvider>
      <VehicleDetailContent />
    </VehicleDetailProvider>
  )
}
