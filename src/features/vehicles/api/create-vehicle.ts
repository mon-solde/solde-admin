import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export const createVehicleInputSchema = z.object({
  name: z.string().min(1),
  purchaseDate: z.string().min(1),
  participants: z.array(
    z.object({
      userId: z.string().min(1),
      profitShare: z.number().min(1).max(100),
    })
  ),
})

export type CreateVehicleInput = z.infer<typeof createVehicleInputSchema>

export const createVehicle = ({ data }: { data: CreateVehicleInput }) => {
  return apiClient.post('/v1/vehicles', {
    name: data.name,
    purchaseDate: new Date(data.purchaseDate).toISOString(),
    participants: data.participants,
  })
}

export const useCreateVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}
