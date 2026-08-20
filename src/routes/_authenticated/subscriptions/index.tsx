import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Subscriptions } from '@/features/subscriptions'

const subscriptionsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Kept optional so `navigate({ search: (prev) => ({ ...prev }) })` calls
  // elsewhere don't have to always carry `status`. Absent means "not
  // specified yet" here; the page treats that as 'en cours' — 'tous' is
  // its own explicit choice, only reachable by picking it.
  status: z.enum(['en cours', 'inactif', 'tous']).optional().catch(undefined),
  type: z.enum(['AUTOMATIC', 'MANUAL', 'tous']).optional().catch(undefined),
  filter: z.string().optional().catch(''),
  sortBy: z
    .enum(['name', 'amount', 'dueDay', 'type'])
    .optional()
    .catch(undefined),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/subscriptions/')({
  validateSearch: subscriptionsSearchSchema,
  component: Subscriptions,
})
