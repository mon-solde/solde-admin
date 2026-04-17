import { type Vehicle } from '../../data/schema'
import { expenses as allExpenses } from '../../data/expenses'
import { ExpenseMutateDrawer } from './expense-mutate-drawer'
import { DeclareSoldDialog } from './declare-sold-dialog'
import { useVehicleDetail } from './vehicle-detail-provider'

type VehicleDetailDialogsProps = {
  vehicle: Vehicle
}

export function VehicleDetailDialogs({ vehicle }: VehicleDetailDialogsProps) {
  const { open, setOpen, currentExpense, setCurrentExpense } = useVehicleDetail()
  const vehicleExpenses = allExpenses.filter((e) => e.vehicleId === vehicle.id)

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
        expenses={vehicleExpenses}
        open={open === 'declare-sold'}
        onOpenChange={() => setOpen('declare-sold')}
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
    </>
  )
}
