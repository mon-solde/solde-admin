import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBudgetList } from './budget-list-provider'

export function BudgetListPrimaryButtons() {
  const { setOpen } = useBudgetList()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Nouveau mois</span> <Plus size={18} />
    </Button>
  )
}
