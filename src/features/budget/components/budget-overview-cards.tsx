import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type AutomaticDeduction } from '../data/schema'

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
  automaticDeductions: AutomaticDeduction[]
  manualActionsCount: number
  totalCharges: number
  availableAfterDeductions: number
  onEditSalaryClick: () => void
}

export function BudgetOverviewCards({
  receivedSalary,
  automaticDeductions,
  manualActionsCount,
  totalCharges,
  availableAfterDeductions,
  onEditSalaryClick,
}: BudgetOverviewCardsProps) {
  const totalCount = automaticDeductions.length + manualActionsCount

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
          <p className='text-2xl font-bold'>{formatEuros(receivedSalary)}</p>
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
            − {formatEuros(totalCharges)}
          </p>
          <p className='mt-1 text-xs text-muted-foreground'>
            {totalCount} charge{totalCount > 1 ? 's' : ''}
            {automaticDeductions.length > 0 && manualActionsCount > 0 && (
              <span>
                {' '}
                ({automaticDeductions.length} auto · {manualActionsCount}{' '}
                manuelle{manualActionsCount > 1 ? 's' : ''})
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
            {formatEuros(availableAfterDeductions)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
