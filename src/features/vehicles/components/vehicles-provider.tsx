import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Vehicle } from '../data/schema'

type VehiclesDialogType = 'add' | 'edit' | 'delete'

type VehiclesContextType = {
  open: VehiclesDialogType | null
  setOpen: (str: VehiclesDialogType | null) => void
  currentRow: Vehicle | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Vehicle | null>>
}

const VehiclesContext = React.createContext<VehiclesContextType | null>(null)

export function VehiclesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<VehiclesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Vehicle | null>(null)

  return (
    <VehiclesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </VehiclesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVehicles = () => {
  const ctx = React.useContext(VehiclesContext)
  if (!ctx)
    throw new Error('useVehicles has to be used within <VehiclesProvider>')
  return ctx
}
