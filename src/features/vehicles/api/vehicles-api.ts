import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  vehiclesPageSchema,
  vehicleDetailSchema,
  type VehiclesPage,
} from '../data/schema'

const VEHICLES_KEY = ['vehicles'] as const
const vehicleDetailKey = (id: string) => ['vehicles', id] as const

// ─── Queries ─────────────────────────────────────────────────────────────────

// Single source of truth for "how many rows per page by default" — reused
// by useTableUrlState (features/vehicles/index.tsx) so the table's resolved
// page size and the value actually sent to the backend can never disagree.
export const DEFAULT_PAGE_SIZE = 10

type VehiclesFilters = {
  status?: 'en cours' | 'vendu' | 'tous'
  search?: string
  pageIndex?: number
  pageSize?: number
  sortBy?: 'name' | 'purchaseDate'
  sortOrder?: 'asc' | 'desc'
}

async function fetchVehicles(
  filters: VehiclesFilters = {}
): Promise<VehiclesPage> {
  const { status, search, pageIndex, pageSize, sortBy, sortOrder } = filters
  const params: Record<string, string | number> = {}
  // Absent status means "not specified yet", which defaults to 'en cours' —
  // only an explicit 'tous' should skip the status filter entirely.
  if (status !== 'tous') params.status = status === 'vendu' ? 'SOLD' : 'ACTIVE'
  if (search) params.search = search
  params.page = pageIndex ?? 0
  params.limit = pageSize ?? DEFAULT_PAGE_SIZE
  if (sortBy) params.sortBy = sortBy
  if (sortOrder) params.sortOrder = sortOrder

  const data = await apiClient.get('/v1/vehicles', { params })
  return vehiclesPageSchema.parse(data)
}

async function fetchVehicleDetail(vehicleId: string) {
  const data = await apiClient.get(`/v1/vehicles/${vehicleId}`)
  return vehicleDetailSchema.parse(data)
}

export function useGetVehicles(filters: VehiclesFilters = {}) {
  const { status, search, pageIndex, pageSize, sortBy, sortOrder } = filters
  return useQuery({
    queryKey: [
      ...VEHICLES_KEY,
      status ?? '',
      search ?? '',
      pageIndex ?? 0,
      pageSize ?? DEFAULT_PAGE_SIZE,
      sortBy ?? '',
      sortOrder ?? '',
    ],
    queryFn: () =>
      fetchVehicles({ status, search, pageIndex, pageSize, sortBy, sortOrder }),
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
      participants: Array<{ contactId: string; profitShare: number }>
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
      payers: Array<{
        payerId: string
        amount: number
        source?: 'BANK' | 'CASH'
        imputedToId?: string
      }>
    }) => apiClient.post(`/v1/vehicles/${vehicleId}/expenses`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vehicleDetailKey(vehicleId) }),
  })
}

export function useUpdateExpense(vehicleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      expenseId,
      ...data
    }: {
      expenseId: string
      label: string
      date: string
      payers: Array<{
        payerId: string
        amount: number
        source?: 'BANK' | 'CASH'
        imputedToId?: string
      }>
    }) =>
      apiClient.put(`/v1/vehicles/${vehicleId}/expenses/${expenseId}`, data),
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

export function useAddVehicleEvent(vehicleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { note: string }) =>
      apiClient.post(`/v1/vehicles/${vehicleId}/events`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vehicleDetailKey(vehicleId) }),
  })
}

export function useUpdateVehicleEvent(vehicleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, ...data }: { eventId: string; note: string }) =>
      apiClient.put(`/v1/vehicles/${vehicleId}/events/${eventId}`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vehicleDetailKey(vehicleId) }),
  })
}

export function useDeleteVehicleEvent(vehicleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) =>
      apiClient.delete(`/v1/vehicles/${vehicleId}/events/${eventId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vehicleDetailKey(vehicleId) }),
  })
}

export function useUpdateVehicleParticipants(vehicleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      participants: Array<{ contactId: string; profitShare: number }>
    }) => apiClient.put(`/v1/vehicles/${vehicleId}/participants`, data),
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
      bankAmount?: number
      cashAmount?: number
    }) => apiClient.post(`/v1/vehicles/${vehicleId}/sale`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY })
      queryClient.invalidateQueries({ queryKey: vehicleDetailKey(vehicleId) })
    },
  })
}
