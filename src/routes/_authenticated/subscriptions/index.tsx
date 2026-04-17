import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Subscriptions } from '@/features/subscriptions'

const subscriptionsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  paymentType: z
    .array(z.enum(['automatic', 'manual']))
    .optional()
    .catch([]),
  category: z
    .array(z.enum(['auto', 'telecom', 'ai', 'banking', 'other']))
    .optional()
    .catch([]),
  status: z
    .array(z.enum(['active', 'paused']))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/subscriptions/')({
  validateSearch: subscriptionsSearchSchema,
  component: Subscriptions,
})
