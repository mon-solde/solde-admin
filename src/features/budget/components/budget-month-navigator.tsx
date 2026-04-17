import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type NavigateFn } from '@/hooks/use-table-url-state'

const FRENCH_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

type BudgetMonthNavigatorProps = {
  year: number
  month: number
  navigate: NavigateFn
}

export function BudgetMonthNavigator({ year, month, navigate }: BudgetMonthNavigatorProps) {
  function goToPreviousMonth() {
    if (month === 1) navigate({ search: (p) => ({ ...p, year: year - 1, month: 12 }) })
    else navigate({ search: (p) => ({ ...p, year, month: month - 1 }) })
  }

  function goToNextMonth() {
    if (month === 12) navigate({ search: (p) => ({ ...p, year: year + 1, month: 1 }) })
    else navigate({ search: (p) => ({ ...p, year, month: month + 1 }) })
  }

  return (
    <div className='flex items-center gap-3'>
      <Button variant='outline' size='icon' onClick={goToPreviousMonth}>
        <ChevronLeft size={16} />
      </Button>
      <span className='min-w-40 text-center text-lg font-semibold'>
        {FRENCH_MONTHS[month - 1]} {year}
      </span>
      <Button variant='outline' size='icon' onClick={goToNextMonth}>
        <ChevronRight size={16} />
      </Button>
    </div>
  )
}
