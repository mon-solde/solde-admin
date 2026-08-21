import { Pencil } from 'lucide-react'
import { centsToEuros } from '@/lib/money'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type MonthlyRecurringCharge } from '../data/schema'

function formatEuros(amount: number) {
  return (
    amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €'
  )
}

type BudgetOverviewCardsProps = {
  receivedSalary: number
  recurringCharges: MonthlyRecurringCharge[]
  totalCharges: number
  availableAfterDeductions: number
  onEditSalaryClick: () => void
}

export function BudgetOverviewCards({
  receivedSalary,
  recurringCharges,
  totalCharges,
  availableAfterDeductions,
  onEditSalaryClick,
}: BudgetOverviewCardsProps) {
  const automaticCount = recurringCharges.filter(
    (c) => c.type === 'AUTOMATIC'
  ).length
  const manualCount = recurringCharges.filter(
    (c) => c.type === 'MANUAL'
  ).length
  const totalCount = recurringCharges.length

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            Salaire reçu
          </CardTitle>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={onEditSalaryClick}
          >
            <Pencil size={12} />
          </Button>
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold'>
            {formatEuros(centsToEuros(receivedSalary))}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            Charges totales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold text-red-600'>
            − {formatEuros(centsToEuros(totalCharges))}
          </p>
          <p className='mt-1 text-xs text-muted-foreground'>
            {totalCount} charge{totalCount > 1 ? 's' : ''}
            {automaticCount > 0 && manualCount > 0 && (
              <span>
                {' '}
                ({automaticCount} auto · {manualCount} manuelle
                {manualCount > 1 ? 's' : ''})
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            Reste disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              'text-2xl font-bold',
              availableAfterDeductions >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {formatEuros(centsToEuros(availableAfterDeductions))}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
