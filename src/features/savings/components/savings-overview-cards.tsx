import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatEuros } from '../data/data'

type SavingsOverviewCardsProps = {
  balances: { bank: number; cash: number; total: number }
}

export function SavingsOverviewCards({ balances }: SavingsOverviewCardsProps) {
  const { bank, cash, total } = balances

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            Épargne Banque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn('text-2xl font-bold', bank < 0 && 'text-red-600')}>
            {formatEuros(bank)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            Épargne Espèces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn('text-2xl font-bold', cash < 0 && 'text-red-600')}>
            {formatEuros(cash)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            Total Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              'text-2xl font-bold',
              total < 0 ? 'text-red-600' : 'text-green-600'
            )}
          >
            {formatEuros(total)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
