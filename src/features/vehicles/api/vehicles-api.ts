import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  vehicleSchema,
  vehicleDetailSchema,
  type VehicleStatus,
} from '../data/schema'
import { z } from 'zod'

const VEHICLES_KEY = ['vehicles'] as const
const vehicleDetailKey = (id: string) => ['vehicles', id] as const

// ─── Queries ─────────────────────────────────────────────────────────────────

async function fetchVehicles(status?: VehicleStatus) {
  const params = status ? { status } : undefined
  const data = await apiClient.get('/v1/vehicles', { params })
  return z.array(vehicleSchema).parse(data)
}

async function fetchVehicleDetail(vehicleId: string) {
  const data = await apiClient.get(`/v1/vehicles/${vehicleId}`)
  return vehicleDetailSchema.parse(data)
}

export function useGetVehicles(status?: VehicleStatus) {
  return useQuery({
    queryKey: status ? [...VEHICLES_KEY, status] : VEHICLES_KEY,
    queryFn: () => fetchVehicles(status),
  })
}

export function useGetVehicleDetail(vehicleId: string) {
  return useQuery({
    queryKey: vehicleDetailKey(vehicleId),
    queryFn: () => fetchVehicleDetail(vehicleId),
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useDeleteVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vehicleId: string) =>
      apiClient.delete(`/v1/vehicles/${vehicleId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      purchaseDate: string
      purchasePrice: number
      participants: Array<{ userId: string; profitShare: number }>
    }) => apiClient.post('/v1/vehicles', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  })
}

export function useAddExpense(vehicleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      label: string
      date: string
      payers: Array<{ userId: string; amount: number; source: 'BANK' | 'CASH' }>
    }) => apiClient.post(`/v1/vehicles/${vehicleId}/expenses`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vehicleDetailKey(vehicleId) }),
  })
}

export function useDeleteExpense(vehicleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (expenseId: string) =>
      apiClient.delete(`/v1/vehicles/${vehicleId}/expenses/${expenseId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vehicleDetailKey(vehicleId) }),
  })
}

export function useAddReversement(vehicleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      debtId: string
      amount: number
      date: string
      note?: string
      source: 'BANK' | 'CASH' | 'BOTH'
      bankSplitAmount?: number
    }) =>
      apiClient.post(`/v1/debts/${data.debtId}/repayments`, {
        amount: data.amount,
        date: data.date,
        note: data.note,
        source: data.source,
        bankSplitAmount: data.bankSplitAmount,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vehicleDetailKey(vehicleId) }),
  })
}

export function useDeclareSale(vehicleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      salePrice: number
      soldAt: string
      cashierId: string
      source: 'BANK' | 'CASH'
    }) => apiClient.post(`/v1/vehicles/${vehicleId}/sale`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY })
      queryClient.invalidateQueries({ queryKey: vehicleDetailKey(vehicleId) })
    },
  })
}
