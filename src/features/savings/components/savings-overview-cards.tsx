import { Trans, useLingui } from '@lingui/react/macro'
import { Info } from 'lucide-react'
import { centsToEuros, formatEuros } from '@/lib/money'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type SavingsOverviewCardsProps = {
  balances: { bank: number; cash: number; total: number }
}

export function SavingsOverviewCards({ balances }: SavingsOverviewCardsProps) {
  const { bank, cash, total } = balances
  const { i18n } = useLingui()

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            <Trans>Épargne Banque</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn('text-2xl font-bold', bank < 0 && 'text-red-600')}>
            {formatEuros(centsToEuros(bank), i18n.locale)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>
            <Trans>Épargne Espèces</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn('text-2xl font-bold', cash < 0 && 'text-red-600')}>
            {formatEuros(centsToEuros(cash), i18n.locale)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground'>
            <Trans>Total Global</Trans>
            <Tooltip>
              <TooltipTrigger>
                <Info size={14} />
              </TooltipTrigger>
              <TooltipContent className='max-w-64 text-center'>
                <Trans>
                  Calculé à partir de tous les mouvements d&apos;argent de
                  l&apos;application (prêts, remboursements, salaires, ventes de
                  véhicules…), pas seulement de vos ajustements manuels.
                </Trans>
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
            {formatEuros(centsToEuros(total), i18n.locale)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
