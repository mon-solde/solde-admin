import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  subscriptionSchema,
  type Subscription,
  type RecurringChargeType,
} from '../data/schema'

const RECURRING_CHARGES_KEY = ['recurring-charges'] as const

async function fetchRecurringCharges(): Promise<Subscription[]> {
  const data = await apiClient.get('/v1/recurring-charges')
  return z.array(subscriptionSchema).parse(data)
}

export type CreateRecurringChargePayload = {
  name: string
  amount: number
  type: RecurringChargeType
  dueDay?: number
}

async function createRecurringCharge(
  body: CreateRecurringChargePayload
): Promise<{ id: string }> {
  return apiClient.post('/v1/recurring-charges', body)
}

async function deleteRecurringCharge(id: string): Promise<void> {
  return apiClient.delete(`/v1/recurring-charges/${id}`)
}

async function activateRecurringCharge(id: string): Promise<void> {
  return apiClient.patch(`/v1/recurring-charges/${id}/activate`, {})
}

async function deactivateRecurringCharge(id: string): Promise<void> {
  return apiClient.patch(`/v1/recurring-charges/${id}/deactivate`, {})
}

export function useGetRecurringCharges() {
  return useQuery({
    queryKey: RECURRING_CHARGES_KEY,
    queryFn: fetchRecurringCharges,
  })
}

export function useCreateRecurringCharge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRecurringCharge,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: RECURRING_CHARGES_KEY }),
  })
}

export function useDeleteRecurringCharge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRecurringCharge,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: RECURRING_CHARGES_KEY }),
  })
}

export function useActivateRecurringCharge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: activateRecurringCharge,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: RECURRING_CHARGES_KEY }),
  })
}

export function useDeactivateRecurringCharge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deactivateRecurringCharge,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: RECURRING_CHARGES_KEY }),
  })
}
