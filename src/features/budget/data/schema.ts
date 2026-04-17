import { z } from 'zod'

const actionPaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  paymentDate: z.coerce.date(),
  createdAt: z.coerce.date(),
})
export type ActionPayment = z.infer<typeof actionPaymentSchema>

const monthlyManualActionSchema = z.object({
  subscriptionId: z.string(),
  label: z.string(),
  plannedAmount: z.number(),
  payments: z.array(actionPaymentSchema),
})
export type MonthlyManualAction = z.infer<typeof monthlyManualActionSchema>

const savingsDestinationSchema = z.union([z.literal('bank'), z.literal('cash')])
export type SavingsDestination = z.infer<typeof savingsDestinationSchema>

const savingsWithdrawalSchema = z.object({
  id: z.string(),
  amount: z.number(),
  destination: savingsDestinationSchema,
  withdrawalDate: z.coerce.date(),
  createdAt: z.coerce.date(),
})
export type SavingsWithdrawal = z.infer<typeof savingsWithdrawalSchema>

const monthlyBudgetSchema = z.object({
  id: z.string(),
  month: z.number().min(1).max(12),
  year: z.number(),
  receivedSalary: z.number(),
  savingsWithdrawals: z.array(savingsWithdrawalSchema),
  manualActionEntries: z.array(monthlyManualActionSchema),
})
export type MonthlyBudget = z.infer<typeof monthlyBudgetSchema>
