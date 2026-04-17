import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { VehiclesDialogs } from './components/vehicles-dialogs'
import { VehiclesPrimaryButtons } from './components/vehicles-primary-buttons'
import { VehiclesProvider } from './components/vehicles-provider'
import { VehiclesTable } from './components/vehicles-table'
import { vehicles } from './data/vehicles'

const route = getRouteApi('/_authenticated/vehicles/')

export function Vehicles() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <VehiclesProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Véhicules</h2>
            <p className='text-muted-foreground'>
              Gérez vos véhicules et suivez leur rentabilité.
            </p>
          </div>
          <VehiclesPrimaryButtons />
        </div>
        <VehiclesTable data={vehicles} search={search} navigate={navigate} />
      </Main>

      <VehiclesDialogs />
    </VehiclesProvider>
  )
}
