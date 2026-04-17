import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SavingsDialogs } from './components/savings-dialogs'
import { SavingsOverviewCards } from './components/savings-overview-cards'
import { SavingsPrimaryButtons } from './components/savings-primary-buttons'
import { SavingsProvider } from './components/savings-provider'
import { SavingsTable } from './components/savings-table'

const route = getRouteApi('/_authenticated/savings/')

export function Savings() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <SavingsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Épargne</h2>
            <p className='text-muted-foreground'>Suivi de votre capital épargne.</p>
          </div>
          <SavingsPrimaryButtons />
        </div>
        <SavingsOverviewCards />
        <SavingsTable search={search} navigate={navigate} />
      </Main>

      <SavingsDialogs />
    </SavingsProvider>
  )
}
