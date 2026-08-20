import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Vehicles } from '@/features/vehicles'

const vehiclesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Kept optional so `navigate({ search: (prev) => ({ ...prev }) })` calls
  // elsewhere don't have to always carry `status`. Absent means "not
  // specified yet" here; the vehicles page treats that as 'en cours' —
  // 'tous' is its own explicit choice, only reachable by picking it.
  status: z.enum(['en cours', 'vendu', 'tous']).optional().catch(undefined),
  filter: z.string().optional().catch(''),
  sortBy: z.enum(['name', 'purchaseDate']).optional().catch(undefined),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/vehicles/')({
  validateSearch: vehiclesSearchSchema,
  component: Vehicles,
})
