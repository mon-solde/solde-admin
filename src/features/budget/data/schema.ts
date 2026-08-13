import { z } from 'zod'

const monthlyRecurringChargeSchema = z.object({
  id: z.string(),
  recurringChargeId: z.string().optional(),
  label: z.string(),
  amount: z.number(),
  type: z.enum(['AUTOMATIC', 'MANUAL']),
  dueDay: z.number().min(1).max(31).optional(),
})
export type MonthlyRecurringCharge = z.infer<
  typeof monthlyRecurringChargeSchema
>

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
  recurringCharges: z.array(monthlyRecurringChargeSchema),
  savingsWithdrawals: z.array(budgetSavingsWithdrawalSchema).default([]),
})
export type MonthlyBudget = z.infer<typeof monthlyBudgetSchema>
