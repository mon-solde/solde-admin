import { getRouteApi } from '@tanstack/react-router'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { DEFAULT_PAGE_SIZE, useGetRecurringCharges } from './api/subscriptions-api'
import { SubscriptionsDialogs } from './components/subscriptions-dialogs'
import { SubscriptionsPrimaryButtons } from './components/subscriptions-primary-buttons'
import { SubscriptionsProvider } from './components/subscriptions-provider'
import { SubscriptionsTable } from './components/subscriptions-table'

const route = getRouteApi('/_authenticated/subscriptions/')

// TanStack column id -> backend sort key, and back — the single place this
// mapping is defined, shared by useTableUrlState (URL <-> sorting state)
// and the API call below (sorting state -> request params).
const SORT_COLUMN_TO_API = {
  name: 'name',
  amount: 'amount',
  dueDay: 'dueDay',
  type: 'type',
} as const

const SEARCH_DEBOUNCE_MS = 300

export function Subscriptions() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Single call, single source of truth: the resolved pageIndex/pageSize/
  // sorting below is what both the API request AND the table itself use.
  const {
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    ensurePageInRange,
    globalFilter,
    onGlobalFilterChange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: DEFAULT_PAGE_SIZE },
    globalFilter: { enabled: true, key: 'filter' },
    sorting: {
      columnIdToSortBy: SORT_COLUMN_TO_API,
      defaultSortBy: 'name',
      defaultSortOrder: 'asc',
    },
  })
  const activeSort = sorting[0]
  // The input itself stays bound to `globalFilter` (instant) — only the
  // value driving the request is delayed, so typing doesn't fire a request
  // per keystroke.
  const debouncedSearch = useDebouncedValue(globalFilter, SEARCH_DEBOUNCE_MS)

  const { data: page, isLoading } = useGetRecurringCharges({
    status: search.status,
    type: search.type,
    search: debouncedSearch,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sortBy: activeSort
      ? SORT_COLUMN_TO_API[activeSort.id as keyof typeof SORT_COLUMN_TO_API]
      : undefined,
    sortOrder: activeSort ? (activeSort.desc ? 'desc' : 'asc') : undefined,
  })
  const subscriptions = page?.data ?? []

  return (
    <SubscriptionsProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Charges récurrentes
            </h2>
            <p className='text-muted-foreground'>
              Gérez vos charges récurrentes mensuelles.
            </p>
          </div>
          <SubscriptionsPrimaryButtons />
        </div>
        <SubscriptionsTable
          data={subscriptions}
          rowCount={page?.count ?? 0}
          isLoading={isLoading}
          search={search}
          navigate={navigate}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          ensurePageInRange={ensurePageInRange}
          globalFilter={globalFilter}
          onGlobalFilterChange={onGlobalFilterChange}
        />
      </Main>

      <SubscriptionsDialogs />
    </SubscriptionsProvider>
  )
}
