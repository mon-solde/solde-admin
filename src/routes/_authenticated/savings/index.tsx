import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Savings } from '@/features/savings'

const savingsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
  kind: z.enum(['addition', 'withdrawal']).optional().catch(undefined),
  source: z.enum(['bank', 'cash']).optional().catch(undefined),
  sortBy: z.enum(['date', 'amount']).optional().catch(undefined),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/savings/')({
  validateSearch: savingsSearchSchema,
  component: Savings,
})
