import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SubscriptionsDialogs } from './components/subscriptions-dialogs'
import { SubscriptionsPrimaryButtons } from './components/subscriptions-primary-buttons'
import { SubscriptionsProvider } from './components/subscriptions-provider'
import { SubscriptionsTable } from './components/subscriptions-table'
import { subscriptions } from './data/subscriptions'

const route = getRouteApi('/_authenticated/subscriptions/')

export function Subscriptions() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <SubscriptionsProvider>
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
          search={search}
          navigate={navigate}
        />
      </Main>

      <SubscriptionsDialogs />
    </SubscriptionsProvider>
  )
}
