import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { VehicleDetail } from '@/features/vehicles/detail'

// Filters/pagination/sort for the "Dettes liées à ce véhicule" table
// embedded on this page — same fields as the Dettes route, minus
// vehicleId (already fixed by the route param here, not a user filter).
const vehicleDetailSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  type: z.enum(['prêté', 'emprunté']).optional().catch(undefined),
  status: z.enum(['en cours', 'remboursé', 'pardonné', 'tous']).optional().catch(undefined),
  contactId: z.string().optional().catch(''),
  sortBy: z.enum(['date', 'amount', 'contactName']).optional().catch(undefined),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/vehicles/$vehicleId')({
  validateSearch: vehicleDetailSearchSchema,
  component: VehicleDetail,
})
