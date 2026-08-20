import { getRouteApi } from '@tanstack/react-router'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DEFAULT_PAGE_SIZE, useGetMonthlyBudgets } from './api/budget-api'
import { BudgetListDialogs } from './components/budget-list-dialogs'
import { BudgetListPrimaryButtons } from './components/budget-list-primary-buttons'
import { BudgetListProvider } from './components/budget-list-provider'
import { BudgetListTable } from './components/budget-list-table'

const route = getRouteApi('/_authenticated/budget/')

// TanStack column id -> backend sort key, and back — the single place this
// mapping is defined, shared by useTableUrlState (URL <-> sorting state)
// and the API call below (sorting state -> request params).
const SORT_COLUMN_TO_API = {
  mois: 'month',
  receivedSalary: 'receivedSalary',
} as const

export function BudgetList() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Single call, single source of truth: the resolved pageIndex/pageSize/
  // sorting below is what both the API request AND the table itself use.
  // No globalFilter here — there's nothing worth filtering this list by.
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
      defaultSortBy: 'month',
      defaultSortOrder: 'desc',
    },
  })
  const activeSort = sorting[0]

  const { data: page, isLoading } = useGetMonthlyBudgets({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sortBy: activeSort
      ? SORT_COLUMN_TO_API[activeSort.id as keyof typeof SORT_COLUMN_TO_API]
      : undefined,
    sortOrder: activeSort ? (activeSort.desc ? 'desc' : 'asc') : undefined,
  })
  const budgets = page?.data ?? []

  return (
    <BudgetListProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Budget mensuel
            </h2>
            <p className='text-muted-foreground'>
              Gérez vos budgets mensuels ici.
            </p>
          </div>
          <BudgetListPrimaryButtons />
        </div>
        <BudgetListTable
          data={budgets}
          rowCount={page?.count ?? 0}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          ensurePageInRange={ensurePageInRange}
        />
      </Main>

      <BudgetListDialogs />
    </BudgetListProvider>
  )
}
