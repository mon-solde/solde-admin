import { type VehicleDetail } from '../../data/schema'
import { DeclareSoldDialog } from './declare-sold-dialog'
import { EditParticipantsDialog } from './edit-participants-dialog'
import { EventMutateDialog } from './event-mutate-dialog'
import { ExpenseMutateDrawer } from './expense-mutate-drawer'
import { useVehicleDetail } from './vehicle-detail-provider'

type VehicleDetailDialogsProps = {
  vehicle: VehicleDetail
}

export function VehicleDetailDialogs({ vehicle }: VehicleDetailDialogsProps) {
  const {
    open,
    setOpen,
    currentExpense,
    setCurrentExpense,
    currentVehicleEvent,
    setCurrentVehicleEvent,
  } = useVehicleDetail()

  return (
    <>
      <ExpenseMutateDrawer
        key='expense-add'
        vehicle={vehicle}
        open={open === 'add-expense'}
        onOpenChange={() => setOpen('add-expense')}
      />

      {currentExpense && (
        <ExpenseMutateDrawer
          key={`expense-edit-${currentExpense.id}`}
          vehicle={vehicle}
          currentExpense={currentExpense}
          open={open === 'edit-expense'}
          onOpenChange={() => {
            setOpen('edit-expense')
            setTimeout(() => setCurrentExpense(null), 500)
          }}
        />
      )}

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

      <EditParticipantsDialog
        key='edit-participants'
        vehicle={vehicle}
        open={open === 'edit-participants'}
        onOpenChange={() => setOpen('edit-participants')}
      />

      <DeclareSoldDialog
        key='declare-sold'
        vehicle={vehicle}
        open={open === 'declare-sold'}
        onOpenChange={() => setOpen('declare-sold')}
      />
    </>
  )
}
