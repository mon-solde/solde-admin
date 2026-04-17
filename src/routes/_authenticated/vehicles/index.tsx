import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Vehicles } from '@/features/vehicles'

const vehiclesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.union([z.literal('active'), z.literal('sold')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/vehicles/')({
  validateSearch: vehiclesSearchSchema,
  component: Vehicles,
})
