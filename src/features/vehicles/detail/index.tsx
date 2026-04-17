import { getRouteApi, Link } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, CircleDashed, Pencil, PlusIcon, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { vehicles } from '../data/vehicles'
import { expenses as allExpenses } from '../data/expenses'
import { statusColorMap } from '../data/data'
import { VehicleDetailProvider } from './components/vehicle-detail-provider'
import { VehicleDetailDialogs } from './components/vehicle-detail-dialogs'
import { useVehicleDetail } from './components/vehicle-detail-provider'

const route = getRouteApi('/_authenticated/vehicles/$vehicleId')

function VehicleDetailContent() {
  const { vehicleId } = route.useParams()
  const { setOpen, setCurrentExpense } = useVehicleDetail()

  const vehicle = vehicles.find((v) => v.id === vehicleId)

  if (!vehicle) {
    return (
      <Main>
        <div className='flex flex-col items-center justify-center gap-4 py-24'>
          <p className='text-muted-foreground'>Véhicule introuvable.</p>
          <Button asChild variant='outline'>
            <Link to='/vehicles'>Retour à la liste</Link>
          </Button>
        </div>
      </Main>
    )
  }

  const vehicleExpenses = allExpenses.filter((e) => e.vehicleId === vehicle.id)
  const totalInvested = vehicleExpenses.reduce((sum, e) => sum + e.totalAmount, 0)
  const netProfit =
    vehicle.status === 'sold' && vehicle.salePrice
      ? vehicle.salePrice - totalInvested
      : null

  const participantSummary = vehicle.participants.map((p) => {
    const invested = vehicleExpenses.reduce((sum, e) => {
      const payer = e.payers.find((pay) => pay.userId === p.userId)
      return sum + (payer?.amount ?? 0)
    }, 0)
    const profitAmount =
      netProfit !== null && netProfit > 0
        ? (netProfit * p.profitShare) / 100
        : 0
    return { ...p, invested, profitAmount, total: invested + profitAmount }
  })

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
            <span className='font-semibold'>
              {vehicle.make} {vehicle.model}
            </span>
            <span className='text-muted-foreground'>({vehicle.year})</span>
            <Badge
              variant='outline'
              className={cn('ms-1', statusColorMap[vehicle.status])}
            >
              {vehicle.status === 'active' ? (
                <CircleDashed size={12} className='me-1' />
              ) : (
                <CheckCircle2 size={12} className='me-1' />
              )}
              {vehicle.status === 'active' ? 'En cours' : 'Vendu'}
            </Badge>
          </div>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        {/* Cards résumé */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total investi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>
                {totalInvested.toLocaleString('fr-FR')} €
              </p>
              <p className='text-xs text-muted-foreground'>
                {vehicleExpenses.length} dépense
                {vehicleExpenses.length > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Prix de vente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.salePrice ? (
                <p className='text-2xl font-bold text-green-600'>
                  {vehicle.salePrice.toLocaleString('fr-FR')} €
                </p>
              ) : (
                <p className='text-2xl font-bold text-muted-foreground'>—</p>
              )}
              {vehicle.soldAt && (
                <p className='text-xs text-muted-foreground'>
                  Vendu le{' '}
                  {vehicle.soldAt.toLocaleDateString('fr-FR')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Bénéfice net
              </CardTitle>
            </CardHeader>
            <CardContent>
              {netProfit !== null ? (
                <>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      netProfit >= 0 ? 'text-green-600' : 'text-red-500'
                    )}
                  >
                    {netProfit >= 0 ? '+' : ''}
                    {netProfit.toLocaleString('fr-FR')} €
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {((netProfit / totalInvested) * 100).toFixed(1)}% de rendement
                  </p>
                </>
              ) : (
                <>
                  <p className='text-2xl font-bold text-muted-foreground'>—</p>
                  <p className='text-xs text-muted-foreground'>Véhicule en cours</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>{vehicle.participants.length}</p>
              <p className='text-xs text-muted-foreground'>
                {vehicle.participants.map((p) => p.userName.split(' ')[0]).join(', ')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Participants */}
          <div className='space-y-3'>
            <h3 className='font-semibold'>
              {vehicle.status === 'sold' ? 'Répartition de la vente' : 'Participants'}
            </h3>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className='text-end'>% bénéf.</TableHead>
                    <TableHead className='text-end'>Investi</TableHead>
                    {vehicle.status === 'sold' && (
                      <TableHead className='text-end'>Gain</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participantSummary.map((p) => (
                    <TableRow key={p.userId}>
                      <TableCell className='font-medium'>{p.userName}</TableCell>
                      <TableCell className='text-end'>
                        <Badge variant='outline'>{p.profitShare}%</Badge>
                      </TableCell>
                      <TableCell className='text-end'>
                        {p.invested.toLocaleString('fr-FR')} €
                      </TableCell>
                      {vehicle.status === 'sold' && (
                        <TableCell className='text-end text-green-600'>
                          +{p.profitAmount.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Dépenses */}
          <div className='space-y-3 lg:col-span-2'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold'>Dépenses</h3>
              <div className='flex gap-2'>
                {vehicle.status === 'active' && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='gap-1'
                    onClick={() => setOpen('declare-sold')}
                  >
                    <TrendingUp size={14} />
                    Déclarer vendu
                  </Button>
                )}
                <Button
                  size='sm'
                  className='gap-1'
                  onClick={() => setOpen('add-expense')}
                >
                  <PlusIcon size={14} />
                  Ajouter
                </Button>
              </div>
            </div>

            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payeurs</TableHead>
                    <TableHead className='text-end'>Total</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleExpenses.length > 0 ? (
                    vehicleExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className='font-medium'>
                          {expense.label}
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {expense.date.toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <span className='text-sm text-muted-foreground'>
                            {expense.payers
                              .map(
                                (p) =>
                                  `${p.userName.split(' ')[0]} ${p.amount.toLocaleString('fr-FR')} €`
                              )
                              .join(' · ')}
                          </span>
                        </TableCell>
                        <TableCell className='text-end font-medium'>
                          {expense.totalAmount.toLocaleString('fr-FR')} €
                        </TableCell>
                        <TableCell className='text-end'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-muted-foreground'
                            onClick={() => {
                              setCurrentExpense(expense)
                              setOpen('edit-expense')
                            }}
                          >
                            <Pencil size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                        Aucune dépense enregistrée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Main>

      <VehicleDetailDialogs vehicle={vehicle} />
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
