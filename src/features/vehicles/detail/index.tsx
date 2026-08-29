import { useMemo, useState } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowLeft, CheckCircle2, CircleDashed } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { centsToEuros, formatEuros } from '@/lib/money'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { LanguageSwitch } from '@/components/language-switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
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
import { VehicleDetailDialogs } from './components/vehicle-detail-dialogs'
import {
  VehicleDetailProvider,
  useVehicleDetail,
} from './components/vehicle-detail-provider'
import { VehicleExpensesSection } from './components/vehicle-expenses-section'
import { VehicleNotesSection } from './components/vehicle-notes-section'
import { VehicleParticipantsTable } from './components/vehicle-participants-table'
import { VehicleSummaryCards } from './components/vehicle-summary-cards'

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
  const { i18n, t } = useLingui()
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
      <Main className='flex flex-1 flex-col gap-6'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-24 rounded-xl' />
          ))}
        </div>
        <div className='grid gap-6 lg:grid-cols-3'>
          <Skeleton className='h-64 rounded-xl' />
          <Skeleton className='h-64 rounded-xl lg:col-span-2' />
        </div>
        <Skeleton className='h-40 rounded-xl' />
        <Skeleton className='h-64 rounded-xl' />
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

  const isSold = vehicle.status === 'SOLD'

  const confirmDeleteExpense = () => {
    if (!pendingDeleteExpense) return
    deleteExpense(pendingDeleteExpense.id, {
      onSuccess: () => {
        toast.success(t`Dépense supprimée.`)
        setPendingDeleteExpense(null)
      },
      onError: () => {
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
      onError: () => {
        setPendingDeleteEvent(null)
      },
    })
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
        <VehicleSummaryCards vehicle={vehicle} />

        <div className='grid gap-6 lg:grid-cols-3'>
          <VehicleParticipantsTable
            vehicle={vehicle}
            isSold={isSold}
            onEditParticipants={() => setOpen('edit-participants')}
          />

          <VehicleExpensesSection
            vehicle={vehicle}
            isSold={isSold}
            ownerId={ownerId}
            onDeclareSold={() => setOpen('declare-sold')}
            onAddExpense={() => setOpen('add-expense')}
            onEditExpense={handleEditExpense}
            onDeleteExpense={setPendingDeleteExpense}
          />
        </div>

        <VehicleNotesSection
          vehicle={vehicle}
          onAddEvent={() => setOpen('add-event')}
          onEditEvent={handleEditEvent}
          onDeleteEvent={setPendingDeleteEvent}
        />

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
                <span className='font-bold'>{pendingDeleteExpense.label}</span>{' '}
                (
                {formatEuros(
                  centsToEuros(pendingDeleteExpense.totalAmount),
                  i18n.locale
                )}
                ) ? Cette action est irréversible.
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
                Êtes-vous sûr de vouloir supprimer cette note ? Cette action est
                irréversible.
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
