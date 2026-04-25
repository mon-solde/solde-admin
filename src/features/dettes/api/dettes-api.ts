import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { detteSchema, type Dette } from '../data/schema'

const DEBTS_KEY = ['debts'] as const

async function fetchDebts(): Promise<Dette[]> {
  const data = await apiClient.get('/v1/debts')
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
      : { lenderId: personId, ...rest }
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
  bankAmount?: number
  cashAmount?: number
}

async function addRepayment({
  debtId,
  ...body
}: AddRepaymentPayload): Promise<{ id: string }> {
  return apiClient.post(`/v1/debts/${debtId}/repayments`, body)
}

export function useGetDettes() {
  return useQuery({
    queryKey: DEBTS_KEY,
    queryFn: fetchDebts,
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

export function useAddRepayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addRepayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEBTS_KEY }),
  })
}
