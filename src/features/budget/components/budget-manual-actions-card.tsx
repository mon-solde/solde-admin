import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ActionPayment, type MonthlyManualAction } from '../data/schema'
import { calculateTotalPaid, formatEuros, resolveActionState } from '../data/data'
import { BudgetActionPaymentSheet } from './budget-action-payment-sheet'

const stateStyles: Record<string, string> = {
  pending: 'text-gray-500 bg-gray-50 border-gray-200',
  partial: 'text-amber-600 bg-amber-50 border-amber-200',
  done: 'text-green-600 bg-green-50 border-green-200',
}

const stateLabels: Record<string, string> = {
  pending: 'À faire',
  partial: 'Partiel',
  done: 'Fait ✓',
}

type BudgetManualActionsCardProps = {
  entries: MonthlyManualAction[]
  paymentsByAction: Record<string, ActionPayment[]>
  month: number
  year: number
  onAddPayment: (subscriptionId: string, payment: { amount: number; paymentDate: Date }) => void
}

export function BudgetManualActionsCard({
  entries,
  paymentsByAction,
  month,
  year,
  onAddPayment,
}: BudgetManualActionsCardProps) {
  const [selectedEntry, setSelectedEntry] = useState<MonthlyManualAction | null>(null)

  return (
    <>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Actions manuelles</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {entries.map((entry) => {
            const payments = paymentsByAction[entry.subscriptionId] ?? []
            const totalPaid = calculateTotalPaid(payments)
            const state = resolveActionState(totalPaid, entry.plannedAmount)

            return (
              <button
                key={entry.subscriptionId}
                type='button'
                onClick={() => setSelectedEntry(entry)}
                className='flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition-colors hover:bg-muted'
              >
                <span className='flex-1 text-sm font-medium'>{entry.label}</span>
                <div className='flex items-center gap-3'>
                  <span className='text-sm text-muted-foreground'>
                    {formatEuros(totalPaid)}
                    <span className='text-xs'> / {formatEuros(entry.plannedAmount)}</span>
                  </span>
                  <Badge variant='outline' className={cn('w-20 justify-center text-xs', stateStyles[state])}>
                    {stateLabels[state]}
                  </Badge>
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      {selectedEntry && (
        <BudgetActionPaymentSheet
          entry={selectedEntry}
          payments={paymentsByAction[selectedEntry.subscriptionId] ?? []}
          month={month}
          year={year}
          open={selectedEntry !== null}
          onOpenChange={(open) => { if (!open) setSelectedEntry(null) }}
          onAddPayment={(payment) => {
            onAddPayment(selectedEntry.subscriptionId, payment)
          }}
        />
      )}
    </>
  )
}
