import { Trans } from '@lingui/react/macro'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDettes } from './dettes-provider'

export function DettesPrimaryButtons() {
  const { setOpen } = useDettes()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>
          <Trans>Ajouter</Trans>
        </span>{' '}
        <Plus size={18} />
      </Button>
    </div>
  )
}
