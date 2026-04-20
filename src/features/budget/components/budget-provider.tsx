import React from 'react'
import useDialogState from '@/hooks/use-dialog-state'

type BudgetDialogType = 'initMonth' | 'editSalary'

type BudgetContextType = {
  open: BudgetDialogType | null
  setOpen: (type: BudgetDialogType | null) => void
}

const BudgetContext = React.createContext<BudgetContextType | null>(null)

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<BudgetDialogType>(null)

  return <BudgetContext value={{ open, setOpen }}>{children}</BudgetContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBudget = () => {
  const ctx = React.useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget has to be used within <BudgetProvider>')
  return ctx
}
