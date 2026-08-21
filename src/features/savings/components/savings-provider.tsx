import React, { useState } from 'react'
import { toast } from 'sonner'
import { eurosToCents } from '@/lib/money'
import useDialogState from '@/hooks/use-dialog-state'
import { useCreateSavingsEvent, useDeleteSavingsEvent } from '../api/savings-api'
import { type SavingsHistoryEntry } from '../data/data'

type SavingsDialogType = 'add' | 'delete'

type CreateManualMovementInput = {
  kind: 'addition' | 'withdrawal'
  source: 'bank' | 'cash'
  amount: number
  label: string
  date: Date
}

type SavingsContextType = {
  open: SavingsDialogType | null
  setOpen: (str: SavingsDialogType | null) => void
  currentRow: SavingsHistoryEntry | null
  setCurrentRow: React.Dispatch<
    React.SetStateAction<SavingsHistoryEntry | null>
  >
  addMovement: (
    movement: CreateManualMovementInput,
    callbacks?: { onSuccess?: () => void }
  ) => void
  deleteMovement: (id: string, callbacks?: { onSuccess?: () => void }) => void
}

const SavingsContext = React.createContext<SavingsContextType | null>(null)

export function SavingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SavingsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<SavingsHistoryEntry | null>(null)

  const { mutate: createEvent } = useCreateSavingsEvent()
  const { mutate: deleteEvent } = useDeleteSavingsEvent()

  function addMovement(
    movement: CreateManualMovementInput,
    callbacks?: { onSuccess?: () => void }
  ) {
    createEvent(
      {
        kind: movement.kind.toUpperCase() as 'ADDITION' | 'WITHDRAWAL',
        source: movement.source.toUpperCase() as 'BANK' | 'CASH',
        amount: eurosToCents(movement.amount),
        label: movement.label,
        date: movement.date.toISOString().split('T')[0],
      },
      {
        onSuccess: () => {
          toast.success('Mouvement enregistré')
          callbacks?.onSuccess?.()
        },
        onError: (error: any) =>
          toast.error(
            error?.response?.data?.message ?? 'Une erreur est survenue.'
          ),
      }
    )
  }

  function deleteMovement(id: string, callbacks?: { onSuccess?: () => void }) {
    deleteEvent(id, {
      onSuccess: () => {
        toast.success('Mouvement supprimé')
        callbacks?.onSuccess?.()
      },
      onError: (error: any) =>
        toast.error(
          error?.response?.data?.message ?? 'Une erreur est survenue.'
        ),
    })
  }

  return (
    <SavingsContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
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
