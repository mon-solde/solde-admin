import { useAddActionPayment, useAddSavingsWithdrawal } from '../api/budget-api'
import { type MonthlyBudget, type SavingsDestination } from '../data/schema'

export function useBudgetState(budget: MonthlyBudget) {
  const { mutate: mutateAddPayment } = useAddActionPayment()
  const { mutate: mutateAddWithdrawal } = useAddSavingsWithdrawal()

  const totalAutomaticDeductions = budget.automaticDeductions.reduce(
    (sum, d) => sum + d.amount,
    0
  )
  const totalManualPlanned = budget.manualActions.reduce(
    (sum, a) => sum + a.plannedAmount,
    0
  )
  const totalCharges = totalAutomaticDeductions + totalManualPlanned
  const availableAfterDeductions = budget.receivedSalary - totalCharges
  const availableForSavings = availableAfterDeductions

  const totalSaved = budget.savingsWithdrawals.reduce(
    (sum, w) => sum + w.amount,
    0
  )
  const remainingToSave = availableForSavings - totalSaved

  function addPayment(
    actionId: string,
    payment: { amount: number; paymentDate: Date }
  ) {
    mutateAddPayment({
      budgetId: budget.id,
      actionId,
      amount: payment.amount,
      paymentDate: payment.paymentDate.toISOString().split('T')[0],
    })
  }

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
    automaticDeductions: budget.automaticDeductions,
    totalCharges,
    availableAfterDeductions,
    availableForSavings,
    totalSaved,
    remainingToSave,
    addPayment,
    addSavingsWithdrawal,
  }
}
