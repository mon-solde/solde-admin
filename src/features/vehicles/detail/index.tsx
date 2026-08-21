import { useState } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { Cross2Icon } from '@radix-ui/react-icons'
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  Pencil,
  PlusIcon,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useGetVehicleDetail,
  useDeleteExpense,
  useDeleteVehicleEvent,
} from '../api/vehicles-api'
import { statusColorMap } from '../data/data'
import { type Expense, type VehicleEvent } from '../data/schema'
import { PayersCell } from './components/payers-cell'
import { ReversementsSection } from './components/reversements-section'
import { VehicleDetailDialogs } from './components/vehicle-detail-dialogs'
import {
  VehicleDetailProvider,
  useVehicleDetail,
} from './components/vehicle-detail-provider'

type ExpenseGroup = { dateKey: string; date: Date; expenses: Expense[] }

const route = getRouteApi('/_authenticated/vehicles/$vehicleId')

function VehicleDetailContent() {
  const { vehicleId } = route.useParams()
  const { setOpen, setCurrentExpense, setCurrentVehicleEvent } =
    useVehicleDetail()
  const { data: vehicle, isLoading } = useGetVehicleDetail(vehicleId)
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

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center py-24'>
          <p className='text-muted-foreground'>Chargement…</p>
        </div>
      </Main>
    )
  }

  if (!vehicle) {
    return (
      <Main>
        <div className='flex flex-col items-center justify-center gap-4 py-24'>
          <p className='text-muted-foreground'>Véhicule introuvable.</p>
          <Button asChild variant='outline'>
            <Link to='/vehicles'>Retour à la liste</Link>
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
        toast.success('Dépense supprimée.')
        setPendingDeleteExpense(null)
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ?? 'Une erreur est survenue.'
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
        toast.success('Événement supprimé.')
        setPendingDeleteEvent(null)
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ?? 'Une erreur est survenue.'
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
              {isSold ? 'Vendu' : 'En cours'}
            </Badge>
          </div>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
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
                Total investi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>
                {centsToEuros(financialSummary.totalExpenses).toLocaleString('fr-FR')} €
              </p>
              <p className='text-xs text-muted-foreground'>
                {vehicle.expenses.length} dépense
                {vehicle.expenses.length > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Prix de vente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.soldVehicle ? (
                <>
                  <p className='text-2xl font-bold text-green-600'>
                    {centsToEuros(vehicle.soldVehicle.salePrice).toLocaleString('fr-FR')} €
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Vendu le{' '}
                    {vehicle.soldVehicle.soldAt.toLocaleDateString('fr-FR')}
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
                      : 'Vous'
                    return (
                      <p className='text-xs text-muted-foreground'>
                        Encaissé par{' '}
                        <span className='font-medium text-foreground'>
                          {cashierName}
                        </span>
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
                Bénéfice net
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
                    {centsToEuros(financialSummary.profit).toLocaleString('fr-FR')} €
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Après dépenses et prix d&apos;achat
                  </p>
                </>
              ) : (
                <>
                  <p className='text-2xl font-bold text-muted-foreground'>—</p>
                  <p className='text-xs text-muted-foreground'>
                    Véhicule en cours
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>
                {vehicle.participants.length + 1}
              </p>
              <p className='text-xs text-muted-foreground'>
                {['Vous', ...vehicle.participants.map((p) => p.firstName)].join(
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
                {isSold ? 'Répartition de la vente' : 'Participants'}
              </h3>
              {!isSold && (
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-1'
                  onClick={() => setOpen('edit-participants')}
                >
                  <Pencil size={14} />
                  Modifier
                </Button>
              )}
            </div>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className='text-end'>% bénéf.</TableHead>
                    <TableHead className='text-end'>Investi</TableHead>
                    {isSold && (
                      <TableHead className='text-end'>À recevoir</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className='font-medium'>Vous</TableCell>
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
              <h3 className='font-semibold'>Dépenses</h3>
              <div className='flex gap-2'>
                {!isSold && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='gap-1'
                    onClick={() => setOpen('declare-sold')}
                  >
                    <TrendingUp size={14} />
                    Déclarer vendu
                  </Button>
                )}
                {!isSold && (
                  <Button
                    size='sm'
                    className='gap-1'
                    onClick={() => setOpen('add-expense')}
                  >
                    <PlusIcon size={14} />
                    Ajouter
                  </Button>
                )}
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Input
                placeholder='Filtrer par nom...'
                value={expenseSearch}
                onChange={(event) => setExpenseSearch(event.target.value)}
                className='h-8 w-full sm:w-[250px]'
              />
              <Select value={payerFilter} onValueChange={setPayerFilter}>
                <SelectTrigger className='h-8 w-full sm:w-[180px]'>
                  <SelectValue placeholder='Participant' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tous les participants</SelectItem>
                  <SelectItem value={ownerId}>Vous</SelectItem>
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
                  Réinitialiser
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
                {hasActiveFilter
                  ? 'Aucune dépense ne correspond aux filtres.'
                  : 'Aucune dépense enregistrée.'}
              </div>
            )}
          </div>
        </div>

        {/* Notes libres */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold'>Notes</h3>
            <Button
              variant='outline'
              size='sm'
              className='gap-1'
              onClick={() => setOpen('add-event')}
            >
              <PlusIcon size={14} />
              Ajouter
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
              Aucune note enregistrée.
            </div>
          )}
        </div>

        {vehicle.reversements.length > 0 && (
          <ReversementsSection
            reversements={vehicle.reversements}
            vehicleId={vehicle.id}
            vehicleName={vehicle.name}
          />
        )}
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
          title='Supprimer cette dépense'
          desc={
            <p>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className='font-bold'>{pendingDeleteExpense.label}</span>{' '}
              (
              {centsToEuros(pendingDeleteExpense.totalAmount).toLocaleString('fr-FR')} €) ?
              Cette action est irréversible.
            </p>
          }
          confirmText='Supprimer'
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
          title='Supprimer cet événement'
          desc={
            <p>
              Êtes-vous sûr de vouloir supprimer cette note ? Cette action est
              irréversible.
            </p>
          }
          confirmText='Supprimer'
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
