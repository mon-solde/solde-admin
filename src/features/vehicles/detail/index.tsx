import { getRouteApi, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  PlusIcon,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
import { useGetVehicleDetail, useDeleteExpense } from '../api/vehicles-api'
import { statusColorMap } from '../data/data'
import { PayersCell } from './components/payers-cell'
import { ReversementsSection } from './components/reversements-section'
import { VehicleDetailDialogs } from './components/vehicle-detail-dialogs'
import {
  VehicleDetailProvider,
  useVehicleDetail,
} from './components/vehicle-detail-provider'

const route = getRouteApi('/_authenticated/vehicles/$vehicleId')

function VehicleDetailContent() {
  const { vehicleId } = route.useParams()
  const { setOpen } = useVehicleDetail()
  const { data: vehicle, isLoading } = useGetVehicleDetail(vehicleId)
  const { mutate: deleteExpense } = useDeleteExpense(vehicleId)

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center py-24'>
          <p className='text-muted-foreground'>Chargement…</p>
        </div>
      </Main>
    )
  }

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

  const { financialSummary } = vehicle
  const isSold = vehicle.status === 'SOLD'

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(expenseId, {
      onSuccess: () => toast.success('Dépense supprimée.'),
      onError: (error: any) =>
        toast.error(
          error?.response?.data?.message ?? 'Une erreur est survenue.'
        ),
    })
  }

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
            <span className='font-semibold'>{vehicle.name}</span>
            <Badge
              variant='outline'
              className={cn('ms-1', statusColorMap[vehicle.status])}
            >
              {isSold ? (
                <CheckCircle2 size={12} className='me-1' />
              ) : (
                <CircleDashed size={12} className='me-1' />
              )}
              {isSold ? 'Vendu' : 'En cours'}
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
                {financialSummary.totalExpenses.toLocaleString('fr-FR')} €
              </p>
              <p className='text-xs text-muted-foreground'>
                {vehicle.expenses.length} dépense
                {vehicle.expenses.length > 1 ? 's' : ''}
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
              {vehicle.soldVehicle ? (
                <>
                  <p className='text-2xl font-bold text-green-600'>
                    {vehicle.soldVehicle.salePrice.toLocaleString('fr-FR')} €
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Vendu le{' '}
                    {vehicle.soldVehicle.soldAt.toLocaleDateString('fr-FR')}
                  </p>
                  {(() => {
                    const cashier = vehicle.participants.find(
                      (p) => p.userId === vehicle.soldVehicle!.cashierId
                    )
                    return cashier ? (
                      <p className='text-xs text-muted-foreground'>
                        Encaissé par{' '}
                        <span className='font-medium text-foreground'>
                          {cashier.firstName} {cashier.lastName}
                        </span>
                      </p>
                    ) : null
                  })()}
                </>
              ) : (
                <p className='text-2xl font-bold text-muted-foreground'>—</p>
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
              {financialSummary.profit !== null ? (
                <>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      financialSummary.profit >= 0
                        ? 'text-green-600'
                        : 'text-red-500'
                    )}
                  >
                    {financialSummary.profit >= 0 ? '+' : ''}
                    {financialSummary.profit.toLocaleString('fr-FR')} €
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Après dépenses et prix d&apos;achat
                  </p>
                </>
              ) : (
                <>
                  <p className='text-2xl font-bold text-muted-foreground'>—</p>
                  <p className='text-xs text-muted-foreground'>
                    Véhicule en cours
                  </p>
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
              <p className='text-2xl font-bold'>
                {vehicle.participants.length}
              </p>
              <p className='text-xs text-muted-foreground'>
                {vehicle.participants.map((p) => p.firstName).join(', ')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Participants / Répartition */}
          <div className='space-y-3'>
            <h3 className='font-semibold'>
              {isSold ? 'Répartition de la vente' : 'Participants'}
            </h3>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className='text-end'>% bénéf.</TableHead>
                    <TableHead className='text-end'>Investi</TableHead>
                    {isSold && (
                      <TableHead className='text-end'>À recevoir</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialSummary.participants.map((p) => (
                    <TableRow key={p.userId}>
                      <TableCell className='font-medium'>
                        {p.firstName} {p.lastName}
                      </TableCell>
                      <TableCell className='text-end'>
                        <Badge variant='outline'>{p.profitShare}%</Badge>
                      </TableCell>
                      <TableCell className='text-end'>
                        {p.totalInvested.toLocaleString('fr-FR')} €
                      </TableCell>
                      {isSold && (
                        <TableCell className='text-end font-medium text-green-600'>
                          {p.amountToReceive !== null
                            ? `${p.amountToReceive.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`
                            : '—'}
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
                {!isSold && (
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
                {!isSold && (
                  <Button
                    size='sm'
                    className='gap-1'
                    onClick={() => setOpen('add-expense')}
                  >
                    <PlusIcon size={14} />
                    Ajouter
                  </Button>
                )}
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
                    {!isSold && <TableHead />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicle.expenses.length > 0 ? (
                    vehicle.expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className='font-medium'>
                          {expense.label}
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {expense.date.toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <PayersCell payers={expense.payers} />
                        </TableCell>
                        <TableCell className='text-end font-medium'>
                          {expense.totalAmount.toLocaleString('fr-FR')} €
                        </TableCell>
                        {!isSold && (
                          <TableCell className='text-end'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-muted-foreground hover:text-destructive'
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={isSold ? 4 : 5}
                        className='h-24 text-center text-muted-foreground'
                      >
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

      {isSold && vehicle.reversements.length > 0 && (
        <ReversementsSection
          reversements={vehicle.reversements}
          vehicleId={vehicle.id}
          vehicleName={vehicle.name}
        />
      )}

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
