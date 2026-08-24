import { PlusIcon } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import { Button } from '@/components/ui/button'
import { useSubscriptions } from './subscriptions-provider'

export function SubscriptionsPrimaryButtons() {
  const { setOpen } = useSubscriptions()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>
        <Trans>Nouvelle charge</Trans>
      </span>
      <PlusIcon size={18} />
    </Button>
  )
}
