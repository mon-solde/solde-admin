import { centsToEuros } from '@/lib/money'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  chargeTypeColorMap,
  chargeTypeLabels,
  formatBillingDay,
  formatEuros,
} from '../data/data'
import { type MonthlyRecurringCharge } from '../data/schema'

type BudgetChargesCardProps = {
  entries: MonthlyRecurringCharge[]
}

export function BudgetChargesCard({ entries }: BudgetChargesCardProps) {
  const sortedEntries = [...entries].sort((a, b) =>
    a.label.localeCompare(b.label, 'fr')
  )

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          Charges
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {sortedEntries.map((entry) => (
          <div
            key={entry.id}
            className='flex items-center justify-between rounded-md border px-4 py-3'
          >
            <div className='flex flex-col gap-0.5'>
              <span className='text-sm font-medium'>{entry.label}</span>
              {entry.type === 'AUTOMATIC' && entry.dueDay && (
                <span className='text-xs text-muted-foreground'>
                  {formatBillingDay(entry.dueDay)}
                </span>
              )}
            </div>
            <div className='flex items-center gap-3'>
              <span className='text-sm font-medium'>
                {formatEuros(centsToEuros(entry.amount))}
              </span>
              <Badge
                variant='outline'
                className={cn('text-xs', chargeTypeColorMap[entry.type])}
              >
                {chargeTypeLabels[entry.type]}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
