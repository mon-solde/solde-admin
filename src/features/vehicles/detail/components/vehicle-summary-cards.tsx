import { Plural, Trans, useLingui } from '@lingui/react/macro'
import { formatShortDate } from '@/lib/dates'
import { centsToEuros, formatEuros } from '@/lib/money'
import { cn, formatPersonName } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type VehicleDetail } from '../../data/schema'

type VehicleSummaryCardsProps = {
  vehicle: VehicleDetail
}

export function VehicleSummaryCards({ vehicle }: VehicleSummaryCardsProps) {
  const { i18n, t } = useLingui()
  const { financialSummary } = vehicle

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            <Trans>Total investi</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold'>
            {formatEuros(
              centsToEuros(financialSummary.totalExpenses),
              i18n.locale
            )}
          </p>
          <p className='text-xs text-muted-foreground'>
            <Plural
              value={vehicle.expenses.length}
              one='# dépense'
              other='# dépenses'
            />
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            <Trans>Prix de vente</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicle.soldVehicle ? (
            <>
              <p className='text-2xl font-bold text-green-600'>
                {formatEuros(
                  centsToEuros(vehicle.soldVehicle.salePrice),
                  i18n.locale
                )}
              </p>
              <p className='text-xs text-muted-foreground'>
                <Trans>
                  Vendu le{' '}
                  {formatShortDate(vehicle.soldVehicle.soldAt, i18n.locale)}
                </Trans>
              </p>
              {(() => {
                const cashier = vehicle.participants.find(
                  (p) => p.contactId === vehicle.soldVehicle!.cashierId
                )
                // No matching contact means the owner cashed it in — a
                // cashier is always either the owner or one of their
                // contacts.
                const cashierName = cashier
                  ? formatPersonName(cashier.firstName, cashier.lastName)
                  : t`Vous`
                return (
                  <p className='text-xs text-muted-foreground'>
                    <Trans>
                      Encaissé par{' '}
                      <span className='font-medium text-foreground'>
                        {cashierName}
                      </span>
                    </Trans>
                  </p>
                )
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
            <Trans>Bénéfice net</Trans>
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
                {formatEuros(
                  centsToEuros(financialSummary.profit),
                  i18n.locale
                )}
              </p>
              <p className='text-xs text-muted-foreground'>
                <Trans>Après dépenses et prix d&apos;achat</Trans>
              </p>
            </>
          ) : (
            <>
              <p className='text-2xl font-bold text-muted-foreground'>—</p>
              <p className='text-xs text-muted-foreground'>
                <Trans>Véhicule en cours</Trans>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            <Trans>Participants</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold'>
            {vehicle.participants.length + 1}
          </p>
          <p className='text-xs text-muted-foreground'>
            {[t`Vous`, ...vehicle.participants.map((p) => p.firstName)].join(
              ', '
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
