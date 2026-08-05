import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useGetDettes } from './api/dettes-api'
import { DettesDialogs } from './components/dettes-dialogs'
import { DettesPrimaryButtons } from './components/dettes-primary-buttons'
import { DettesProvider } from './components/dettes-provider'
import { DettesTable } from './components/dettes-table'

const route = getRouteApi('/_authenticated/dettes/')
const fmt = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export function Dettes() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data: rawDettes = [], isLoading } = useGetDettes({
    contactId: search.contactId,
    type: search.type,
    status: search.status,
    vehicleId: search.vehicleId,
  })
  const { auth } = useAuthStore()
  const accountNo = auth.user?.accountNo ?? ''

  const dettes = useMemo(
    () =>
      rawDettes.map((d) => ({
        ...d,
        role:
          d.lenderId === accountNo ? ('lent' as const) : ('borrowed' as const),
      })),
    [rawDettes, accountNo]
  )

  const { onMeDoit, nbPrets, jeDois, nbEmprunts, net } = useMemo(() => {
    const prets = dettes.filter((d) => d.role === 'lent')
    const emprunts = dettes.filter((d) => d.role === 'borrowed')
    const onMeDoit = prets.reduce((sum, d) => sum + d.remaining, 0)
    const jeDois = emprunts.reduce((sum, d) => sum + d.remaining, 0)
    return {
      onMeDoit,
      nbPrets: prets.length,
      jeDois,
      nbEmprunts: emprunts.length,
      net: onMeDoit - jeDois,
    }
  }, [dettes])

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
          isLoading={isLoading}
          search={search}
          navigate={navigate}
        />
      </Main>

      <DettesDialogs />
    </DettesProvider>
  )
}
