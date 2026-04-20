import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { BudgetListDialogs } from './components/budget-list-dialogs'
import { BudgetListPrimaryButtons } from './components/budget-list-primary-buttons'
import { BudgetListProvider } from './components/budget-list-provider'
import { BudgetListTable } from './components/budget-list-table'

const route = getRouteApi('/_authenticated/budget/')

export function BudgetList() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

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
        <BudgetListTable search={search} navigate={navigate} />
      </Main>

      <BudgetListDialogs />
    </BudgetListProvider>
  )
}
