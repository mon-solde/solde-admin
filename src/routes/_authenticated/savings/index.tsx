import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Savings } from '@/features/savings'

const savingsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  kind: z.array(z.enum(['addition', 'withdrawal'])).optional().catch([]),
  source: z.array(z.enum(['bank', 'cash'])).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/savings/')({
  validateSearch: savingsSearchSchema,
  component: Savings,
})
