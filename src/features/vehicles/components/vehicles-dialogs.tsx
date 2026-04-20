import { VehiclesActionDialog } from './vehicles-action-dialog'
import { VehiclesDeleteDialog } from './vehicles-delete-dialog'
import { useVehicles } from './vehicles-provider'

export function VehiclesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useVehicles()

  return (
    <>
      <VehiclesActionDialog
        key='vehicle-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <VehiclesActionDialog
            key={`vehicle-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
          <VehiclesDeleteDialog
            key={`vehicle-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
