import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { useGetMonthlyBudgets } from '../api/budget-api'
import { type MonthlyBudget } from '../data/schema'

type BudgetListDialogType = 'add' | 'delete'

type BudgetListContextType = {
  open: BudgetListDialogType | null
  setOpen: (str: BudgetListDialogType | null) => void
  currentRow: MonthlyBudget | null
  setCurrentRow: React.Dispatch<React.SetStateAction<MonthlyBudget | null>>
  budgets: MonthlyBudget[]
  isLoading: boolean
}

const BudgetListContext = React.createContext<BudgetListContextType | null>(
  null
)

export function BudgetListProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<BudgetListDialogType>(null)
  const [currentRow, setCurrentRow] = useState<MonthlyBudget | null>(null)
  const { data = [], isLoading } = useGetMonthlyBudgets()

  return (
    <BudgetListContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        budgets: data,
        isLoading,
      }}
    >
      {children}
    </BudgetListContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBudgetList = () => {
  const ctx = React.useContext(BudgetListContext)
  if (!ctx)
    throw new Error('useBudgetList has to be used within <BudgetListProvider>')
  return ctx
}
