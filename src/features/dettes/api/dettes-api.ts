import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { dettesPageSchema, type DettesPage } from '../data/schema'

const DEBTS_KEY = ['debts'] as const

// Single source of truth for "how many rows per page by default" — reused
// by useTableUrlState (features/dettes/index.tsx) so the table's resolved
// page size and the value actually sent to the backend can never disagree.
export const DEFAULT_PAGE_SIZE = 10

export type DettesFilters = {
  contactId?: string
  type?: 'prêté' | 'emprunté'
  status?: 'en cours' | 'remboursé' | 'tous'
  vehicleId?: string
  // 0-based, matching the backend directly (PaginatedQueryBase) — the only
  // 1-based/0-based conversion happens once, inside useTableUrlState.
  pageIndex?: number
  pageSize?: number
  sortBy?: 'date' | 'amount' | 'contactName'
  sortOrder?: 'asc' | 'desc'
}

async function fetchDebts(filters: DettesFilters = {}): Promise<DettesPage> {
  const { contactId, type, status, vehicleId, pageIndex, pageSize, sortBy, sortOrder } =
    filters
  const params: Record<string, string | number> = {}
  if (contactId) params.contactId = contactId
  if (type) params.role = type === 'prêté' ? 'LENDER' : 'BORROWER'
  // Absent status means "not specified yet", which defaults to 'en cours' —
  // only an explicit 'tous' should skip the status filter entirely.
  if (status !== 'tous')
    params.status = status === 'remboursé' ? 'REPAID' : 'ONGOING'
  if (vehicleId) params.vehicleId = vehicleId
  params.page = pageIndex ?? 0
  params.limit = pageSize ?? DEFAULT_PAGE_SIZE
  if (sortBy) params.sortBy = sortBy
  if (sortOrder) params.sortOrder = sortOrder

  const data = await apiClient.get('/v1/debts', { params })
  return dettesPageSchema.parse(data)
}

export type CreateDettePayload = {
  role: 'lent' | 'borrowed'
  personId: string
  amount: number
  date: string
  description?: string
  bankAmount?: number
  cashAmount?: number
}

async function createDette({
  role,
  personId,
  bankAmount,
  cashAmount,
  ...rest
}: CreateDettePayload): Promise<{ id: string }> {
  const endpoint = role === 'lent' ? '/v1/debts/lent' : '/v1/debts/borrowed'
  const body =
    role === 'lent'
      ? { borrowerId: personId, bankAmount, cashAmount, ...rest }
      : { lenderId: personId, bankAmount, cashAmount, ...rest }
  return apiClient.post(endpoint, body)
}

async function deleteDette(id: string): Promise<void> {
  return apiClient.delete(`/v1/debts/${id}`)
}

export type AddRepaymentPayload = {
  debtId: string
  amount: number
  date: string
  note?: string
  source: 'BANK' | 'CASH' | 'BOTH'
  bankSplitAmount?: number
}

async function addRepayment({
  debtId,
  ...body
}: AddRepaymentPayload): Promise<{ id: string }> {
  return apiClient.post(`/v1/debts/${debtId}/repayments`, body)
}

export function useGetDettes(filters: DettesFilters = {}) {
  const { contactId, type, status, vehicleId, pageIndex, pageSize, sortBy, sortOrder } =
    filters
  return useQuery({
    queryKey: [
      ...DEBTS_KEY,
      contactId ?? '',
      type ?? '',
      status ?? '',
      vehicleId ?? '',
      pageIndex ?? 0,
      pageSize ?? DEFAULT_PAGE_SIZE,
      sortBy ?? '',
      sortOrder ?? '',
    ],
    queryFn: () =>
      fetchDebts({
        contactId,
        type,
        status,
        vehicleId,
        pageIndex,
        pageSize,
        sortBy,
        sortOrder,
      }),
  })
}

export function useCreateDette() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDette,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEBTS_KEY }),
  })
}

export function useDeleteDette() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDette,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEBTS_KEY }),
  })
}

async function deleteRepayment({
  debtId,
  repaymentId,
}: {
  debtId: string
  repaymentId: string
}): Promise<void> {
  return apiClient.delete(`/v1/debts/${debtId}/repayments/${repaymentId}`)
}

export function useAddRepayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addRepayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEBTS_KEY }),
  })
}

export function useDeleteRepayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRepayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEBTS_KEY }),
  })
}
