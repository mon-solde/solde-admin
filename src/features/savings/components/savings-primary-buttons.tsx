import { Trans } from '@lingui/react/macro'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSavings } from './savings-provider'

export function SavingsPrimaryButtons() {
  const { setOpen } = useSavings()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>
        <Trans>Ajouter un mouvement</Trans>
      </span>
      <PlusIcon size={18} />
    </Button>
  )
}
