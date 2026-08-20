import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DEFAULT_PAGE_SIZE, useGetDettes } from './api/dettes-api'
import { DettesDialogs } from './components/dettes-dialogs'
import { DettesPrimaryButtons } from './components/dettes-primary-buttons'
import { DettesProvider } from './components/dettes-provider'
import { DettesTable } from './components/dettes-table'

const route = getRouteApi('/_authenticated/dettes/')
const fmt = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

// TanStack column id -> backend sort key, and back — the single place this
// mapping is defined, shared by useTableUrlState (URL <-> sorting state)
// and the API call below (sorting state -> request params).
const SORT_COLUMN_TO_API = {
  personne: 'contactName',
  amount: 'amount',
  date: 'date',
} as const

const emptyTotals = {
  lentRemaining: 0,
  borrowedRemaining: 0,
  net: 0,
  lentCount: 0,
  borrowedCount: 0,
}

export function Dettes() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Single call, single source of truth: the resolved pageIndex/pageSize/
  // sorting below is what both the API request AND the table itself use —
  // no second place where "no value in the URL" could resolve to a
  // different default than what's actually sent to the backend.
  const {
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: DEFAULT_PAGE_SIZE },
    globalFilter: { enabled: false },
    sorting: {
      columnIdToSortBy: SORT_COLUMN_TO_API,
      defaultSortBy: 'date',
      defaultSortOrder: 'desc',
    },
  })
  const activeSort = sorting[0]

  const { data: page, isLoading } = useGetDettes({
    contactId: search.contactId,
    type: search.type,
    status: search.status,
    vehicleId: search.vehicleId,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sortBy: activeSort
      ? SORT_COLUMN_TO_API[activeSort.id as keyof typeof SORT_COLUMN_TO_API]
      : undefined,
    sortOrder: activeSort ? (activeSort.desc ? 'desc' : 'asc') : undefined,
  })
  const { auth } = useAuthStore()
  const accountNo = auth.user?.accountNo ?? ''

  const dettes = useMemo(
    () =>
      (page?.data ?? []).map((d) => ({
        ...d,
        role:
          d.lenderId === accountNo ? ('lent' as const) : ('borrowed' as const),
      })),
    [page, accountNo]
  )

  const {
    lentRemaining: onMeDoit,
    borrowedRemaining: jeDois,
    net,
    lentCount: nbPrets,
    borrowedCount: nbEmprunts,
  } = page?.totals ?? emptyTotals

  return (
    <DettesProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Dettes</h2>
            <p className='text-muted-foreground'>
              Suivez vos prêts et emprunts en un seul endroit.
            </p>
          </div>
          <DettesPrimaryButtons />
        </div>

        <Card className='grid grid-cols-1 gap-4 rounded-none border-0 bg-transparent p-0 shadow-none sm:grid-cols-3'>
          <Card>
            <CardContent className='flex flex-col gap-1 p-5'>
              <Label className='text-xs tracking-widest text-muted-foreground uppercase'>
                On me doit
              </Label>
              <CardTitle className='text-2xl font-bold text-emerald-600 tabular-nums'>
                +{fmt.format(onMeDoit)}
              </CardTitle>
              <Label className='text-xs text-muted-foreground'>
                {nbPrets} prêt{nbPrets !== 1 ? 's' : ''}
              </Label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex flex-col gap-1 p-5'>
              <Label className='text-xs tracking-widest text-muted-foreground uppercase'>
                Je dois
              </Label>
              <CardTitle className='text-2xl font-bold text-rose-500 tabular-nums'>
                -{fmt.format(jeDois)}
              </CardTitle>
              <Label className='text-xs text-muted-foreground'>
                {nbEmprunts} emprunt{nbEmprunts !== 1 ? 's' : ''}
              </Label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex flex-col gap-1 p-5'>
              <Label className='text-xs tracking-widest text-muted-foreground uppercase'>
                Solde net
              </Label>
              <CardTitle
                className={`text-2xl font-bold tabular-nums ${net >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}
              >
                {net >= 0 ? '+' : ''}
                {fmt.format(net)}
              </CardTitle>
              <Label className='text-xs text-muted-foreground'>
                {net >= 0 ? 'En votre faveur' : 'En votre défaveur'}
              </Label>
            </CardContent>
          </Card>
        </Card>

        <DettesTable
          data={dettes}
          rowCount={page?.count ?? 0}
          isLoading={isLoading}
          search={search}
          navigate={navigate}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          ensurePageInRange={ensurePageInRange}
        />
      </Main>

      <DettesDialogs />
    </DettesProvider>
  )
}
