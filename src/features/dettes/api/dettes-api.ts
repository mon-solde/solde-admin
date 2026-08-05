import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { detteSchema, type Dette } from '../data/schema'

const DEBTS_KEY = ['debts'] as const

export type DettesFilters = {
  contactId?: string
  type?: 'prêté' | 'emprunté'
  status?: 'en cours' | 'remboursé' | 'tous'
  vehicleId?: string
}

async function fetchDebts(filters: DettesFilters = {}): Promise<Dette[]> {
  const { contactId, type, status, vehicleId } = filters
  const params: Record<string, string> = {}
  if (contactId) params.contactId = contactId
  if (type) params.role = type === 'prêté' ? 'LENDER' : 'BORROWER'
  // Absent status means "not specified yet", which defaults to 'en cours' —
  // only an explicit 'tous' should skip the status filter entirely.
  if (status !== 'tous')
    params.status = status === 'remboursé' ? 'REPAID' : 'ONGOING'
  if (vehicleId) params.vehicleId = vehicleId

  const data = await apiClient.get('/v1/debts', {
    params: Object.keys(params).length ? params : undefined,
  })
  return z.array(detteSchema).parse(data)
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
  const { contactId, type, status, vehicleId } = filters
  return useQuery({
    queryKey: [
      ...DEBTS_KEY,
      contactId ?? '',
      type ?? '',
      status ?? '',
      vehicleId ?? '',
    ],
    queryFn: () => fetchDebts({ contactId, type, status, vehicleId }),
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
