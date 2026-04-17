import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Subscription } from '@/features/subscriptions/data/schema'

function formatEuros(amount: number) {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

type BudgetOverviewCardsProps = {
  receivedSalary: number
  activeAutomaticSubscriptions: Subscription[]
  totalAutomaticDeductions: number
  availableAfterDeductions: number
  onEditSalaryClick: () => void
}

export function BudgetOverviewCards({
  receivedSalary,
  activeAutomaticSubscriptions,
  totalAutomaticDeductions,
  availableAfterDeductions,
  onEditSalaryClick,
}: BudgetOverviewCardsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Salaire reçu</CardTitle>
          <Button variant='ghost' size='icon' className='h-6 w-6' onClick={onEditSalaryClick}>
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
            Prélèvements automatiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold text-red-600'>− {formatEuros(totalAutomaticDeductions)}</p>
          <p className='mt-1 text-xs text-muted-foreground'>
            {activeAutomaticSubscriptions.length} prélèvement{activeAutomaticSubscriptions.length > 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Reste disponible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn('text-2xl font-bold', availableAfterDeductions >= 0 ? 'text-green-600' : 'text-red-600')}>
            {formatEuros(availableAfterDeductions)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
