import { PlusIcon } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import { Button } from '@/components/ui/button'
import { useVehicles } from './vehicles-provider'

export function VehiclesPrimaryButtons() {
  const { setOpen } = useVehicles()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>
        <Trans>Nouveau véhicule</Trans>
      </span>
      <PlusIcon size={18} />
    </Button>
  )
}
