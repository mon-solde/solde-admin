import { useState } from 'react'
import { subscriptions } from '@/features/subscriptions/data/subscriptions'
import { type ActionPayment, type MonthlyBudget, type SavingsWithdrawal } from '../data/schema'

export function useBudgetState(budget: MonthlyBudget) {
  const activeAutomaticSubscriptions = subscriptions.filter(
    (s) => s.status === 'active' && s.paymentType === 'automatic'
  )

  const [paymentsByAction, setPaymentsByAction] = useState<Record<string, ActionPayment[]>>(
    Object.fromEntries(budget.manualActionEntries.map((e) => [e.subscriptionId, e.payments]))
  )

  const [savingsWithdrawals, setSavingsWithdrawals] = useState<SavingsWithdrawal[]>(
    budget.savingsWithdrawals
  )

  const totalAutomaticDeductions = activeAutomaticSubscriptions
    .reduce((sum, s) => sum + s.amount, 0)

  const availableAfterDeductions = budget.receivedSalary - totalAutomaticDeductions

  const totalManualPaid = Object.values(paymentsByAction)
    .flat()
    .reduce((sum, p) => sum + p.amount, 0)

  const availableForSavings = availableAfterDeductions - totalManualPaid

  const totalSaved = savingsWithdrawals.reduce((sum, w) => sum + w.amount, 0)
  const remainingToSave = availableForSavings - totalSaved

  function addPayment(subscriptionId: string, payment: { amount: number; paymentDate: Date }) {
    const newPayment: ActionPayment = {
      id: `pay-${Date.now()}`,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      createdAt: new Date(),
    }
    setPaymentsByAction((prev) => ({
      ...prev,
      [subscriptionId]: [...(prev[subscriptionId] ?? []), newPayment],
    }))
  }

  // TODO: quand un retrait est enregistré ici, créer automatiquement 2 mouvements dans l'épargne :
  // 1. kind='withdrawal', source='bank' — le salaire quitte le compte courant
  // 2. kind='addition', source=withdrawal.destination — l'argent arrive dans la destination (bank ou cash)
  function addSavingsWithdrawal(withdrawal: { amount: number; destination: 'bank' | 'cash'; withdrawalDate: Date }) {
    const newWithdrawal: SavingsWithdrawal = {
      id: `sav-${Date.now()}`,
      amount: withdrawal.amount,
      destination: withdrawal.destination,
      withdrawalDate: withdrawal.withdrawalDate,
      createdAt: new Date(),
    }
    setSavingsWithdrawals((prev) => [...prev, newWithdrawal])
  }

  return {
    activeAutomaticSubscriptions,
    paymentsByAction,
    addPayment,
    savingsWithdrawals,
    addSavingsWithdrawal,
    totalAutomaticDeductions,
    availableAfterDeductions,
    totalManualPaid,
    availableForSavings,
    totalSaved,
    remainingToSave,
  }
}
