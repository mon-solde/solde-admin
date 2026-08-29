import { getRouteApi } from '@tanstack/react-router'
import { Trans } from '@lingui/react/macro'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { LanguageSwitch } from '@/components/language-switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DEFAULT_PAGE_SIZE, useGetSavings } from './api/savings-api'
import { SavingsDialogs } from './components/savings-dialogs'
import { SavingsOverviewCards } from './components/savings-overview-cards'
import { SavingsPrimaryButtons } from './components/savings-primary-buttons'
import { SavingsProvider } from './components/savings-provider'
import { SavingsTable } from './components/savings-table'

const route = getRouteApi('/_authenticated/savings/')

// TanStack column id -> backend sort key, and back — the single place this
// mapping is defined, shared by useTableUrlState (URL <-> sorting state)
// and the API call below (sorting state -> request params).
const SORT_COLUMN_TO_API = {
  date: 'date',
  amount: 'amount',
} as const

const SEARCH_DEBOUNCE_MS = 300

export function Savings() {
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
      defaultSortBy: 'date',
      defaultSortOrder: 'desc',
    },
  })
  const activeSort = sorting[0]
  // The input itself stays bound to `globalFilter` (instant) — only the
  // value driving the request is delayed, so typing doesn't fire a request
  // per keystroke.
  const debouncedSearch = useDebouncedValue(globalFilter, SEARCH_DEBOUNCE_MS)

  const { data: page, isLoading } = useGetSavings({
    kind: search.kind,
    source: search.source,
    search: debouncedSearch,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sortBy: activeSort
      ? SORT_COLUMN_TO_API[activeSort.id as keyof typeof SORT_COLUMN_TO_API]
      : undefined,
    sortOrder: activeSort ? (activeSort.desc ? 'desc' : 'asc') : undefined,
  })
  const history = page?.data ?? []
  const balances = page?.balances ?? { bank: 0, cash: 0, total: 0 }

  return (
    <SavingsProvider>
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
              <Trans>Épargne</Trans>
            </h2>
            <p className='text-muted-foreground'>
              <Trans>
                Combien vous avez actuellement de côté et pouvez dépenser.
              </Trans>
            </p>
          </div>
          <SavingsPrimaryButtons />
        </div>
        <SavingsOverviewCards balances={balances} />
        <SavingsTable
          data={history}
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

      <SavingsDialogs />
    </SavingsProvider>
  )
}
