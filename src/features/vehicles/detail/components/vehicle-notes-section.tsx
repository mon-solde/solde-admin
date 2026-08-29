import { Trans } from '@lingui/react/macro'
import { Pencil, PlusIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { type VehicleDetail, type VehicleEvent } from '../../data/schema'

type VehicleNotesSectionProps = {
  vehicle: VehicleDetail
  onAddEvent: () => void
  onEditEvent: (event: VehicleEvent) => void
  onDeleteEvent: (event: VehicleEvent) => void
}

export function VehicleNotesSection({
  vehicle,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}: VehicleNotesSectionProps) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>
          <Trans>Notes</Trans>
        </h3>
        <Button
          variant='outline'
          size='sm'
          className='gap-1'
          onClick={onAddEvent}
        >
          <PlusIcon size={14} />
          <Trans>Ajouter</Trans>
        </Button>
      </div>

      {vehicle.events.length > 0 ? (
        <div className='space-y-2'>
          {vehicle.events.map((event) => (
            <div
              key={event.id}
              className='flex items-start justify-between gap-3 rounded-md border p-3'
            >
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type='button'
                    className='min-w-0 flex-1 text-start hover:text-foreground'
                  >
                    <span className='line-clamp-2 block text-sm break-words text-muted-foreground italic'>
                      {event.note}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className='text-sm whitespace-pre-wrap not-italic'>
                  {event.note}
                </PopoverContent>
              </Popover>
              <div className='flex shrink-0 items-center gap-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-muted-foreground hover:text-foreground'
                  onClick={() => onEditEvent(event)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-muted-foreground hover:text-destructive'
                  onClick={() => onDeleteEvent(event)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='rounded-md border py-8 text-center text-sm text-muted-foreground'>
          <Trans>Aucune note enregistrée.</Trans>
        </div>
      )}
    </div>
  )
}
