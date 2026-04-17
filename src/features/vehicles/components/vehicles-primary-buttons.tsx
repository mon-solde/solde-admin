import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVehicles } from './vehicles-provider'

export function VehiclesPrimaryButtons() {
  const { setOpen } = useVehicles()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Nouveau véhicule</span>
      <PlusIcon size={18} />
    </Button>
  )
}
