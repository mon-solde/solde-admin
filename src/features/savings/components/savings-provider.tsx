import React, { useState } from 'react'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import {
  useGetSavings,
  useCreateSavingsEvent,
  useDeleteSavingsEvent,
} from '../api/savings-api'
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
  history: SavingsHistoryEntry[]
  totals: { bank: number; cash: number; total: number }
  isLoading: boolean
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

  const { data, isLoading } = useGetSavings()
  const { mutate: createEvent } = useCreateSavingsEvent()
  const { mutate: deleteEvent } = useDeleteSavingsEvent()

  const history: SavingsHistoryEntry[] = (data?.history ?? []).map((e) => ({
    id: e.id,
    sourceType: e.sourceType,
    date: e.date,
    label: e.label,
    note: e.note,
    amount: e.amount,
    kind: e.kind,
    source: e.source,
  }))

  const totals = data?.balances ?? { bank: 0, cash: 0, total: 0 }

  function addMovement(
    movement: CreateManualMovementInput,
    callbacks?: { onSuccess?: () => void }
  ) {
    createEvent(
      {
        kind: movement.kind.toUpperCase() as 'ADDITION' | 'WITHDRAWAL',
        source: movement.source.toUpperCase() as 'BANK' | 'CASH',
        amount: movement.amount,
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
        history,
        totals,
        isLoading,
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
