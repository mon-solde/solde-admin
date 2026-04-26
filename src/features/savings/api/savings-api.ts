import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export const SAVINGS_KEY = ['savings'] as const

const savingsHistoryItemSchema = z.object({
  id: z.string(),
  kind: z
    .enum(['ADDITION', 'WITHDRAWAL'])
    .transform((v) => v.toLowerCase() as 'addition' | 'withdrawal'),
  source: z
    .enum(['BANK', 'CASH'])
    .transform((v) => v.toLowerCase() as 'bank' | 'cash'),
  amount: z.number(),
  label: z.string(),
  note: z.string().optional(),
  date: z.coerce.date(),
  sourceType: z
    .enum(['DEBT', 'REPAYMENT', 'BUDGET', 'MANUAL', 'VEHICLE_SALE'])
    .transform(
      (v) =>
        v.toLowerCase() as
          | 'debt'
          | 'repayment'
          | 'budget'
          | 'manual'
          | 'vehicle_sale'
    ),
})

const savingsResponseSchema = z.object({
  balances: z.object({ bank: z.number(), cash: z.number(), total: z.number() }),
  history: z.array(savingsHistoryItemSchema),
})

export type SavingsHistoryItem = z.infer<typeof savingsHistoryItemSchema>
export type SavingsResponse = z.infer<typeof savingsResponseSchema>

async function fetchSavings(): Promise<SavingsResponse> {
  const data = await apiClient.get('/v1/savings/events')
  return savingsResponseSchema.parse(data)
}

export type CreateSavingsEventPayload = {
  kind: 'ADDITION' | 'WITHDRAWAL'
  source: 'BANK' | 'CASH'
  amount: number
  label: string
  date: string
}

async function createSavingsEvent(
  body: CreateSavingsEventPayload
): Promise<{ id: string }> {
  return apiClient.post('/v1/savings/events', body)
}

async function deleteSavingsEvent(id: string): Promise<void> {
  return apiClient.delete(`/v1/savings/events/${id}`)
}

export function useGetSavings() {
  return useQuery({ queryKey: SAVINGS_KEY, queryFn: fetchSavings })
}

export function useCreateSavingsEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSavingsEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SAVINGS_KEY }),
  })
}

export function useDeleteSavingsEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSavingsEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SAVINGS_KEY }),
  })
}
