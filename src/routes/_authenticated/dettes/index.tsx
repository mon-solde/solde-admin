import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Dettes } from '@/features/dettes'
import { detteTypes, detteStatuses } from '@/features/dettes/data/data'

const dettesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  type: z
    .array(z.enum(detteTypes.map((t) => t.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  status: z
    .array(z.enum(detteStatuses.map((s) => s.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dettes/')({
  validateSearch: dettesSearchSchema,
  component: Dettes,
})
