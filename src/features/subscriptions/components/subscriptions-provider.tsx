import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Subscription } from '../data/schema'

type SubscriptionsDialogType = 'add' | 'edit' | 'delete'

type SubscriptionsContextType = {
  open: SubscriptionsDialogType | null
  setOpen: (str: SubscriptionsDialogType | null) => void
  currentRow: Subscription | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Subscription | null>>
}

const SubscriptionsContext =
  React.createContext<SubscriptionsContextType | null>(null)

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<SubscriptionsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Subscription | null>(null)

  return (
    <SubscriptionsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SubscriptionsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSubscriptions = () => {
  const ctx = React.useContext(SubscriptionsContext)
  if (!ctx)
    throw new Error(
      'useSubscriptions has to be used within <SubscriptionsProvider>'
    )
  return ctx
}
