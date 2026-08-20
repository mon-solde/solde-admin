import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  subscriptionsPageSchema,
  type SubscriptionsPage,
  type RecurringChargeType,
} from '../data/schema'

const RECURRING_CHARGES_KEY = ['recurring-charges'] as const

// Single source of truth for "how many rows per page by default" — reused
// by useTableUrlState (features/subscriptions/index.tsx) so the table's
// resolved page size and the value actually sent to the backend can never
// disagree.
export const DEFAULT_PAGE_SIZE = 10

export type SubscriptionsFilters = {
  status?: 'en cours' | 'inactif' | 'tous'
  type?: RecurringChargeType | 'tous'
  search?: string
  pageIndex?: number
  pageSize?: number
  sortBy?: 'name' | 'amount' | 'dueDay' | 'type'
  sortOrder?: 'asc' | 'desc'
}

async function fetchRecurringCharges(
  filters: SubscriptionsFilters = {}
): Promise<SubscriptionsPage> {
  const { status, type, search, pageIndex, pageSize, sortBy, sortOrder } =
    filters
  const params: Record<string, string | number> = {}
  // Absent status means "not specified yet", which defaults to 'en cours' —
  // only an explicit 'tous' should skip the status filter entirely.
  if (status !== 'tous')
    params.status = status === 'inactif' ? 'INACTIVE' : 'ACTIVE'
  if (type && type !== 'tous') params.type = type
  if (search) params.search = search
  params.page = pageIndex ?? 0
  params.limit = pageSize ?? DEFAULT_PAGE_SIZE
  if (sortBy) params.sortBy = sortBy
  if (sortOrder) params.sortOrder = sortOrder

  const data = await apiClient.get('/v1/recurring-charges', { params })
  return subscriptionsPageSchema.parse(data)
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

export type UpdateRecurringChargePayload = CreateRecurringChargePayload & {
  id: string
}

async function updateRecurringCharge({
  id,
  ...body
}: UpdateRecurringChargePayload): Promise<void> {
  return apiClient.put(`/v1/recurring-charges/${id}`, body)
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

export function useGetRecurringCharges(filters: SubscriptionsFilters = {}) {
  const { status, type, search, pageIndex, pageSize, sortBy, sortOrder } =
    filters
  return useQuery({
    queryKey: [
      ...RECURRING_CHARGES_KEY,
      status ?? '',
      type ?? '',
      search ?? '',
      pageIndex ?? 0,
      pageSize ?? DEFAULT_PAGE_SIZE,
      sortBy ?? '',
      sortOrder ?? '',
    ],
    queryFn: () =>
      fetchRecurringCharges({
        status,
        type,
        search,
        pageIndex,
        pageSize,
        sortBy,
        sortOrder,
      }),
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

export function useUpdateRecurringCharge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRecurringCharge,
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
