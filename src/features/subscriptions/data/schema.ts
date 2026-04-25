import { z } from 'zod'

export const recurringChargeTypeSchema = z.enum(['AUTOMATIC', 'MANUAL'])
export type RecurringChargeType = z.infer<typeof recurringChargeTypeSchema>

export const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().min(0),
  dueDay: z.number().min(1).max(31).optional(),
  type: recurringChargeTypeSchema,
  isActive: z.boolean(),
})
export type Subscription = z.infer<typeof subscriptionSchema>
