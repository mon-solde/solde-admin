import { Info } from 'lucide-react'
import { centsToEuros } from '@/lib/money'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
            {formatEuros(centsToEuros(bank))}
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
            {formatEuros(centsToEuros(cash))}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground'>
            Total Global
            <Tooltip>
              <TooltipTrigger>
                <Info size={14} />
              </TooltipTrigger>
              <TooltipContent className='max-w-64 text-center'>
                Calculé à partir de tous les mouvements d&apos;argent de
                l&apos;application (prêts, remboursements, salaires, ventes de
                véhicules…), pas seulement de vos ajustements manuels.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              'text-2xl font-bold',
              total < 0 ? 'text-red-600' : 'text-green-600'
            )}
          >
            {formatEuros(centsToEuros(total))}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
