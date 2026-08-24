import { Plus } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import { Button } from '@/components/ui/button'
import { useBudgetList } from './budget-list-provider'

export function BudgetListPrimaryButtons() {
  const { setOpen } = useBudgetList()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>
        <Trans>Nouveau mois</Trans>
      </span>{' '}
      <Plus size={18} />
    </Button>
  )
}
