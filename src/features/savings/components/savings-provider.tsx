import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import {
  buildSavingsHistory,
  computeSavingsTotals,
  type SavingsHistoryEntry,
} from '../data/data'
import { savingsMovements as initialMovements } from '../data/savings-movements'
import { type SavingsMovement } from '../data/schema'

type SavingsDialogType = 'add' | 'delete'

type SavingsContextType = {
  open: SavingsDialogType | null
  setOpen: (str: SavingsDialogType | null) => void
  currentRow: SavingsHistoryEntry | null
  setCurrentRow: React.Dispatch<
    React.SetStateAction<SavingsHistoryEntry | null>
  >
  history: SavingsHistoryEntry[]
  totals: { bank: number; cash: number; total: number }
  addMovement: (movement: Omit<SavingsMovement, 'id' | 'createdAt'>) => void
  deleteMovement: (id: string) => void
}

const SavingsContext = React.createContext<SavingsContextType | null>(null)

export function SavingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SavingsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<SavingsHistoryEntry | null>(null)
  const [manualMovements, setManualMovements] =
    useState<SavingsMovement[]>(initialMovements)

  const history = buildSavingsHistory(manualMovements)
  const totals = computeSavingsTotals(history)

  function addMovement(movement: Omit<SavingsMovement, 'id' | 'createdAt'>) {
    setManualMovements((prev) => [
      ...prev,
      { ...movement, id: `mov-${Date.now()}`, createdAt: new Date() },
    ])
  }

  function deleteMovement(id: string) {
    setManualMovements((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <SavingsContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        history,
        totals,
        addMovement,
        deleteMovement,
      }}
    >
      {children}
    </SavingsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSavings = () => {
  const ctx = React.useContext(SavingsContext)
  if (!ctx)
    throw new Error('useSavings has to be used within <SavingsProvider>')
  return ctx
}
