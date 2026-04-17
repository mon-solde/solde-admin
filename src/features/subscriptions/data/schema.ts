import { z } from 'zod'

const subscriptionCategorySchema = z.union([
  z.literal('auto'),
  z.literal('telecom'),
  z.literal('ai'),
  z.literal('banking'),
  z.literal('other'),
])
export type SubscriptionCategory = z.infer<typeof subscriptionCategorySchema>

const subscriptionStatusSchema = z.union([
  z.literal('active'),
  z.literal('paused'),
])
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>

const subscriptionPaymentTypeSchema = z.union([
  z.literal('automatic'),
  z.literal('manual'),
])
export type SubscriptionPaymentType = z.infer<typeof subscriptionPaymentTypeSchema>

const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().min(0),
  billingDay: z.number().min(1).max(31).optional(),
  category: subscriptionCategorySchema,
  status: subscriptionStatusSchema,
  paymentType: subscriptionPaymentTypeSchema,
})
export type Subscription = z.infer<typeof subscriptionSchema>
