import { useAddSavingsWithdrawal } from '../api/budget-api'
import { type MonthlyBudget, type SavingsDestination } from '../data/schema'

export function useBudgetState(budget: MonthlyBudget) {
  const { mutate: mutateAddWithdrawal } = useAddSavingsWithdrawal()

  const totalCharges = budget.recurringCharges.reduce(
    (sum, c) => sum + c.amount,
    0
  )
  const availableAfterDeductions = budget.receivedSalary - totalCharges
  const availableForSavings = availableAfterDeductions

  const totalSaved = budget.savingsWithdrawals.reduce(
    (sum, w) => sum + w.amount,
    0
  )
  const remainingToSave = availableForSavings - totalSaved

  function addSavingsWithdrawal(withdrawal: {
    amount: number
    destination: SavingsDestination
    withdrawalDate: Date
  }) {
    mutateAddWithdrawal({
      budgetId: budget.id,
      amount: withdrawal.amount,
      destination: withdrawal.destination,
      withdrawalDate: withdrawal.withdrawalDate.toISOString().split('T')[0],
    })
  }

  return {
    recurringCharges: budget.recurringCharges,
    totalCharges,
    availableAfterDeductions,
    availableForSavings,
    totalSaved,
    remainingToSave,
    addSavingsWithdrawal,
  }
}
