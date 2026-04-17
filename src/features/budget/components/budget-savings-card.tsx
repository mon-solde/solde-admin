import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { type SavingsWithdrawal } from '../data/schema'
import { formatEuros } from '../data/data'
import { BudgetSavingsSheet } from './budget-savings-sheet'

type BudgetSavingsCardProps = {
  availableForSavings: number
  totalSaved: number
  remainingToSave: number
  savingsWithdrawals: SavingsWithdrawal[]
  month: number
  year: number
  onAddWithdrawal: (withdrawal: { amount: number; destination: 'bank' | 'cash'; withdrawalDate: Date }) => void
}

export function BudgetSavingsCard({
  availableForSavings,
  totalSaved,
  remainingToSave,
  savingsWithdrawals,
  month,
  year,
  onAddWithdrawal,
}: BudgetSavingsCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Épargne</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Disponible pour épargner</span>
            <span className={cn('font-semibold', availableForSavings >= 0 ? 'text-green-600' : 'text-red-600')}>
              {formatEuros(availableForSavings)}
            </span>
          </div>

          <Separator />

          <button
            type='button'
            onClick={() => setIsSheetOpen(true)}
            className='flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition-colors hover:bg-muted'
          >
            <span className='text-sm text-muted-foreground'>Mis de côté ce mois</span>
            <span className='font-semibold text-green-600'>{formatEuros(totalSaved)}</span>
          </button>

          <Separator />

          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Reste à retirer</span>
            <span className={cn('font-bold', remainingToSave <= 0 ? 'text-green-600' : 'text-amber-600')}>
              {formatEuros(remainingToSave)}
            </span>
          </div>
          {/* TODO: bouton "Clôturer le mois" — permet d'ignorer un reliquat trop petit à retirer (ex: 2,56€).
              Le montant restant est perdu/absorbé et le mois passe en statut "done". */}
        </CardContent>
      </Card>

      <BudgetSavingsSheet
        withdrawals={savingsWithdrawals}
        totalSaved={totalSaved}
        availableForSavings={availableForSavings}
        month={month}
        year={year}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onAddWithdrawal={onAddWithdrawal}
      />
    </>
  )
}
