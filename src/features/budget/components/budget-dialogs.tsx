import { BudgetEditSalaryDialog } from './budget-edit-salary-dialog'
import { BudgetInitMonthDialog } from './budget-init-month-dialog'
import { useBudget } from './budget-provider'

type BudgetDialogsProps = {
  year: number
  month: number
  budgetId: string | undefined
  currentSalary: number
}

export function BudgetDialogs({
  year,
  month,
  budgetId,
  currentSalary,
}: BudgetDialogsProps) {
  const { open, setOpen } = useBudget()

  return (
    <>
      <BudgetInitMonthDialog
        year={year}
        month={month}
        open={open === 'initMonth'}
        onOpenChange={(state) => {
          if (!state) setOpen(null)
        }}
      />
      <BudgetEditSalaryDialog
        budgetId={budgetId}
        currentSalary={currentSalary}
        open={open === 'editSalary'}
        onOpenChange={(state) => {
          if (!state) setOpen(null)
        }}
      />
    </>
  )
}
