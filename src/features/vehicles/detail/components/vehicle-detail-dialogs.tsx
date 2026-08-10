import { type VehicleDetail } from '../../data/schema'
import { DeclareSoldDialog } from './declare-sold-dialog'
import { EventMutateDialog } from './event-mutate-dialog'
import { ExpenseMutateDrawer } from './expense-mutate-drawer'
import { useVehicleDetail } from './vehicle-detail-provider'

type VehicleDetailDialogsProps = {
  vehicle: VehicleDetail
}

export function VehicleDetailDialogs({ vehicle }: VehicleDetailDialogsProps) {
  const { open, setOpen, currentVehicleEvent, setCurrentVehicleEvent } =
    useVehicleDetail()

  return (
    <>
      <ExpenseMutateDrawer
        key='expense-add'
        vehicle={vehicle}
        open={open === 'add-expense'}
        onOpenChange={() => setOpen('add-expense')}
      />

      <EventMutateDialog
        key='event-add'
        vehicleId={vehicle.id}
        open={open === 'add-event'}
        onOpenChange={() => setOpen('add-event')}
      />

      {currentVehicleEvent && (
        <EventMutateDialog
          key={`event-edit-${currentVehicleEvent.id}`}
          vehicleId={vehicle.id}
          currentEvent={currentVehicleEvent}
          open={open === 'edit-event'}
          onOpenChange={() => {
            setOpen('edit-event')
            setTimeout(() => setCurrentVehicleEvent(null), 500)
          }}
        />
      )}

      <DeclareSoldDialog
        key='declare-sold'
        vehicle={vehicle}
        open={open === 'declare-sold'}
        onOpenChange={() => setOpen('declare-sold')}
      />
    </>
  )
}
