import { getRouteApi, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  MessageSquare,
  Pencil,
  PlusIcon,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatPersonName } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

type TimelineRow =
  | { kind: 'expense'; date: Date; createdAt: Date; data: Expense }
  | { kind: 'event'; date: Date; createdAt: Date; data: VehicleEvent }

const route = getRouteApi('/_authenticated/vehicles/$vehicleId')

function VehicleDetailContent() {
  const { vehicleId } = route.useParams()
  const { setOpen, setCurrentVehicleEvent } = useVehicleDetail()
  const { data: vehicle, isLoading } = useGetVehicleDetail(vehicleId)
  const { mutate: deleteExpense } = useDeleteExpense(vehicleId)
  const { mutate: deleteVehicleEvent } = useDeleteVehicleEvent(vehicleId)

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

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(expenseId, {
      onSuccess: () => toast.success('Dépense supprimée.'),
      onError: (error: any) =>
        toast.error(
          error?.response?.data?.message ?? 'Une erreur est survenue.'
        ),
    })
  }

  const handleEditEvent = (event: VehicleEvent) => {
    setCurrentVehicleEvent(event)
    setOpen('edit-event')
  }

  const handleDeleteEvent = (eventId: string) => {
    deleteVehicleEvent(eventId, {
      onSuccess: () => toast.success('Événement supprimé.'),
      onError: (error: any) =>
        toast.error(
          error?.response?.data?.message ?? 'Une erreur est survenue.'
        ),
    })
  }

  // `date` only carries day precision — createdAt breaks ties between
  // same-day entries, most recent first, consistently (same rule as the
  // rest of the app).
  const timeline: TimelineRow[] = [
    ...vehicle.expenses.map(
      (e): TimelineRow => ({
        kind: 'expense',
        date: e.date,
        createdAt: e.createdAt,
        data: e,
      })
    ),
    ...vehicle.events.map(
      (e): TimelineRow => ({
        kind: 'event',
        date: e.date,
        createdAt: e.createdAt,
        data: e,
      })
    ),
  ].sort(
    (a, b) =>
      b.date.getTime() - a.date.getTime() ||
      b.createdAt.getTime() - a.createdAt.getTime()
  )

  // `timeline` is already sorted by date, so consecutive same-day rows
  // always land in the same group here.
  const timelineGroups: { dateKey: string; date: Date; rows: TimelineRow[] }[] =
    []
  for (const row of timeline) {
    const dateKey = row.date.toDateString()
    const lastGroup = timelineGroups[timelineGroups.length - 1]
    if (lastGroup?.dateKey === dateKey) {
      lastGroup.rows.push(row)
    } else {
      timelineGroups.push({ dateKey, date: row.date, rows: [row] })
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
                {financialSummary.totalExpenses.toLocaleString('fr-FR')} €
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
                    {vehicle.soldVehicle.salePrice.toLocaleString('fr-FR')} €
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
                    {financialSummary.profit.toLocaleString('fr-FR')} €
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
            <h3 className='font-semibold'>
              {isSold ? 'Répartition de la vente' : 'Participants'}
            </h3>
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
                      {financialSummary.owner.totalInvested.toLocaleString(
                        'fr-FR'
                      )}{' '}
                      €
                    </TableCell>
                    {isSold && (
                      <TableCell className='text-end font-medium text-green-600'>
                        {financialSummary.owner.amountToReceive !== null
                          ? `${financialSummary.owner.amountToReceive.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`
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
                        {p.totalInvested.toLocaleString('fr-FR')} €
                      </TableCell>
                      {isSold && (
                        <TableCell className='text-end font-medium text-green-600'>
                          {p.amountToReceive !== null
                            ? `${p.amountToReceive.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`
                            : '—'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Historique (dépenses + événements libres) */}
          <div className='min-w-0 space-y-3 lg:col-span-2'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold'>Historique</h3>
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
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-1'
                  onClick={() => setOpen('add-event')}
                >
                  <MessageSquare size={14} />
                  Note
                </Button>
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

            {timelineGroups.length > 0 ? (
              <div className='space-y-4'>
                {timelineGroups.map((group) => (
                  <div key={group.dateKey} className='space-y-2'>
                    <p className='text-xs font-semibold text-muted-foreground capitalize'>
                      {group.date.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <div className='space-y-2'>
                      {group.rows.map((row) =>
                        row.kind === 'expense' ? (
                          <div
                            key={`expense-${row.data.id}`}
                            className='flex items-start justify-between gap-3 rounded-md border p-3'
                          >
                            <div className='min-w-0 flex-1 space-y-1'>
                              <p className='font-medium break-words'>
                                {row.data.label}
                              </p>
                              <PayersCell payers={row.data.payers} />
                            </div>
                            <div className='flex shrink-0 items-center gap-1'>
                              <span className='font-medium tabular-nums'>
                                {row.data.totalAmount.toLocaleString('fr-FR')}{' '}
                                €
                              </span>
                              {!isSold && (
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8 text-muted-foreground hover:text-destructive'
                                  onClick={() =>
                                    handleDeleteExpense(row.data.id)
                                  }
                                >
                                  <Trash2 size={14} />
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            key={`event-${row.data.id}`}
                            className='flex items-start justify-between gap-3 rounded-md border p-3'
                          >
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type='button'
                                  className='flex min-w-0 flex-1 items-start gap-1.5 text-start text-sm italic text-muted-foreground hover:text-foreground'
                                >
                                  <MessageSquare
                                    size={13}
                                    className='mt-0.5 shrink-0'
                                  />
                                  <span className='line-clamp-2 break-words'>
                                    {row.data.note}
                                  </span>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className='whitespace-pre-wrap text-sm not-italic'>
                                {row.data.note}
                              </PopoverContent>
                            </Popover>
                            <div className='flex shrink-0 items-center gap-1'>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 text-muted-foreground hover:text-foreground'
                                onClick={() => handleEditEvent(row.data)}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 text-muted-foreground hover:text-destructive'
                                onClick={() =>
                                  handleDeleteEvent(row.data.id)
                                }
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='rounded-md border py-12 text-center text-sm text-muted-foreground'>
                Aucun historique enregistré.
              </div>
            )}
          </div>
        </div>
      </Main>

      {isSold && vehicle.reversements.length > 0 && (
        <ReversementsSection
          reversements={vehicle.reversements}
          vehicleId={vehicle.id}
          vehicleName={vehicle.name}
        />
      )}

      <VehicleDetailDialogs vehicle={vehicle} />
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
