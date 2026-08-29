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

  // Closes (or toggles) a dialog, then clears the row it was editing once
  // its exit animation has had time to finish — clearing it immediately
  // would blank the dialog's content while it's still visibly closing.
  const closeDialog = (
    key: Parameters<typeof setOpen>[0],
    clearRow: () => void
  ) => {
    setOpen(key)
    setTimeout(clearRow, 500)
  }

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
          onOpenChange={() =>
            closeDialog('edit-expense', () => setCurrentExpense(null))
          }
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
          onOpenChange={() =>
            closeDialog('edit-event', () => setCurrentVehicleEvent(null))
          }
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
