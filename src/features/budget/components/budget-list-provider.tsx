import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type MonthlyBudget } from '../data/schema'
import { monthlyBudgets as initialBudgets, addMonthlyBudget, removeMonthlyBudget } from '../data/monthly-budgets'

type BudgetListDialogType = 'add' | 'delete'

type BudgetListContextType = {
  open: BudgetListDialogType | null
  setOpen: (str: BudgetListDialogType | null) => void
  currentRow: MonthlyBudget | null
  setCurrentRow: React.Dispatch<React.SetStateAction<MonthlyBudget | null>>
  budgets: MonthlyBudget[]
  addBudget: (budget: MonthlyBudget) => void
  deleteBudget: (id: string) => void
}

const BudgetListContext = React.createContext<BudgetListContextType | null>(null)

export function BudgetListProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<BudgetListDialogType>(null)
  const [currentRow, setCurrentRow] = useState<MonthlyBudget | null>(null)
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([...initialBudgets])

  function addBudget(budget: MonthlyBudget) {
    addMonthlyBudget(budget)
    setBudgets((prev) =>
      [...prev, budget].sort((a, b) =>
        a.year !== b.year ? a.year - b.year : a.month - b.month
      )
    )
  }

  function deleteBudget(id: string) {
    removeMonthlyBudget(id)
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <BudgetListContext value={{ open, setOpen, currentRow, setCurrentRow, budgets, addBudget, deleteBudget }}>
      {children}
    </BudgetListContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBudgetList = () => {
  const ctx = React.useContext(BudgetListContext)
  if (!ctx) throw new Error('useBudgetList has to be used within <BudgetListProvider>')
  return ctx
}
