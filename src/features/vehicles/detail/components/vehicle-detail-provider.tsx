import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Expense } from '../../data/schema'

type VehicleDetailDialogType =
  | 'add-expense'
  | 'edit-expense'
  | 'delete-expense'
  | 'declare-sold'

type VehicleDetailContextType = {
  open: VehicleDetailDialogType | null
  setOpen: (str: VehicleDetailDialogType | null) => void
  currentExpense: Expense | null
  setCurrentExpense: React.Dispatch<React.SetStateAction<Expense | null>>
}

const VehicleDetailContext =
  React.createContext<VehicleDetailContextType | null>(null)

export function VehicleDetailProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<VehicleDetailDialogType>(null)
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null)

  return (
    <VehicleDetailContext
      value={{ open, setOpen, currentExpense, setCurrentExpense }}
    >
      {children}
    </VehicleDetailContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVehicleDetail = () => {
  const ctx = React.useContext(VehicleDetailContext)
  if (!ctx)
    throw new Error(
      'useVehicleDetail has to be used within <VehicleDetailProvider>'
    )
  return ctx
}
