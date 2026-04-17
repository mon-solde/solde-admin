import { useBudget } from './budget-provider'
import { BudgetEditSalaryDialog } from './budget-edit-salary-dialog'
import { BudgetInitMonthDialog } from './budget-init-month-dialog'

type BudgetDialogsProps = {
  year: number
  month: number
  currentSalary: number
}

export function BudgetDialogs({ year, month, currentSalary }: BudgetDialogsProps) {
  const { open, setOpen } = useBudget()

  return (
    <>
      <BudgetInitMonthDialog
        year={year}
        month={month}
        open={open === 'initMonth'}
        onOpenChange={() => setOpen('initMonth')}
      />
      <BudgetEditSalaryDialog
        currentSalary={currentSalary}
        open={open === 'editSalary'}
        onOpenChange={() => setOpen('editSalary')}
      />
    </>
  )
}
