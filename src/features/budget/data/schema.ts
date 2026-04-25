import { z } from 'zod'

const actionPaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  paymentDate: z.coerce.date(),
})
export type ActionPayment = z.infer<typeof actionPaymentSchema>

const automaticDeductionSchema = z.object({
  id: z.string(),
  recurringChargeId: z.string().optional(),
  label: z.string(),
  amount: z.number(),
})
export type AutomaticDeduction = z.infer<typeof automaticDeductionSchema>

const monthlyManualActionSchema = z.object({
  id: z.string(),
  recurringChargeId: z.string().optional(),
  label: z.string(),
  plannedAmount: z.number(),
  payments: z.array(actionPaymentSchema),
})
export type MonthlyManualAction = z.infer<typeof monthlyManualActionSchema>

const savingsDestinationSchema = z.union([z.literal('BANK'), z.literal('CASH')])
export type SavingsDestination = z.infer<typeof savingsDestinationSchema>

const budgetSavingsWithdrawalSchema = z.object({
  id: z.string(),
  amount: z.number(),
  source: savingsDestinationSchema,
  date: z.coerce.date(),
})
export type BudgetSavingsWithdrawal = z.infer<
  typeof budgetSavingsWithdrawalSchema
>

export const monthlyBudgetSchema = z.object({
  id: z.string(),
  month: z.number().min(1).max(12),
  year: z.number(),
  receivedSalary: z.number(),
  automaticDeductions: z.array(automaticDeductionSchema),
  manualActions: z.array(monthlyManualActionSchema),
  savingsWithdrawals: z.array(budgetSavingsWithdrawalSchema).default([]),
})
export type MonthlyBudget = z.infer<typeof monthlyBudgetSchema>
