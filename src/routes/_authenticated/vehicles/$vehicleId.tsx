import { createFileRoute } from '@tanstack/react-router'
import { VehicleDetail } from '@/features/vehicles/detail'

export const Route = createFileRoute('/_authenticated/vehicles/$vehicleId')({
  component: VehicleDetail,
})
