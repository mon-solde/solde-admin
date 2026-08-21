import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { VehicleDetail } from '@/features/vehicles/detail'

// Only paginates/sorts the "Dettes liées à ce véhicule" table embedded on
// this page — no filters here (vehicleId is already fixed by the route).
const vehicleDetailSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  sortBy: z.enum(['date', 'amount', 'contactName']).optional().catch(undefined),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/vehicles/$vehicleId')({
  validateSearch: vehicleDetailSearchSchema,
  component: VehicleDetail,
})
