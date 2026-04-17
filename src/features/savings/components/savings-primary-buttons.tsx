import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSavings } from './savings-provider'

export function SavingsPrimaryButtons() {
  const { setOpen } = useSavings()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Ajouter un mouvement</span>
      <PlusIcon size={18} />
    </Button>
  )
}
