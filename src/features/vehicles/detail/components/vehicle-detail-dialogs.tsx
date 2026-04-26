import { type VehicleDetail } from '../../data/schema'
import { DeclareSoldDialog } from './declare-sold-dialog'
import { ExpenseMutateDrawer } from './expense-mutate-drawer'
import { useVehicleDetail } from './vehicle-detail-provider'

type VehicleDetailDialogsProps = {
  vehicle: VehicleDetail
}

export function VehicleDetailDialogs({ vehicle }: VehicleDetailDialogsProps) {
  const { open, setOpen } = useVehicleDetail()

  return (
    <>
      <ExpenseMutateDrawer
        key='expense-add'
        vehicle={vehicle}
        open={open === 'add-expense'}
        onOpenChange={() => setOpen('add-expense')}
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
