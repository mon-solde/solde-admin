import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Dettes } from '@/features/dettes'

const dettesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  type: z.enum(['prêté', 'emprunté']).optional().catch(undefined),
  // Kept optional so `navigate({ search: (prev) => ({ ...prev }) })` calls
  // elsewhere don't have to always carry `status`. Absent means "not
  // specified yet" here; the debts page treats that as 'en cours' — 'tous'
  // is its own explicit choice, only reachable by actually picking it.
  status: z.enum(['en cours', 'remboursé', 'pardonné', 'tous']).optional().catch(undefined),
  contactId: z.string().optional().catch(''),
  vehicleId: z.string().optional().catch(''),
  sortBy: z.enum(['date', 'amount', 'contactName']).optional().catch(undefined),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/dettes/')({
  validateSearch: dettesSearchSchema,
  component: Dettes,
})
