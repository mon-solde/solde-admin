import { z } from 'zod'
import { isAxiosError } from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  monthlyBudgetSchema,
  type MonthlyBudget,
  type SavingsDestination,
} from '../data/schema'

const MONTHLY_BUDGETS_KEY = ['monthly-budgets'] as const

function budgetByYearMonthKey(year: number, month: number) {
  return [...MONTHLY_BUDGETS_KEY, year, month] as const
}

async function fetchMonthlyBudgets(): Promise<MonthlyBudget[]> {
  const data = await apiClient.get('/v1/monthly-budgets')
  return z.array(monthlyBudgetSchema).parse(data)
}

async function fetchMonthlyBudget(
  year: number,
  month: number
): Promise<MonthlyBudget | null> {
  try {
    const data = await apiClient.get(`/v1/monthly-budgets/${year}/${month}`)
    return monthlyBudgetSchema.parse(data)
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export type InitMonthPayload = {
  year: number
  month: number
  receivedSalary: number
}

async function initMonth(body: InitMonthPayload): Promise<{ id: string }> {
  return apiClient.post('/v1/monthly-budgets', body)
}

async function deleteMonthlyBudget(id: string): Promise<void> {
  return apiClient.delete(`/v1/monthly-budgets/${id}`)
}

export type UpdateSalaryPayload = {
  id: string
  receivedSalary: number
}

async function updateSalary({
  id,
  ...body
}: UpdateSalaryPayload): Promise<void> {
  return apiClient.patch(`/v1/monthly-budgets/${id}/salary`, body)
}

export type AddActionPaymentPayload = {
  budgetId: string
  actionId: string
  amount: number
  paymentDate: string
}

async function addActionPayment({
  budgetId,
  actionId,
  ...body
}: AddActionPaymentPayload): Promise<{ id: string }> {
  return apiClient.post(
    `/v1/monthly-budgets/${budgetId}/actions/${actionId}/payments`,
    body
  )
}

export type AddSavingsWithdrawalPayload = {
  budgetId: string
  amount: number
  destination: SavingsDestination
  withdrawalDate: string
}

async function addSavingsWithdrawal({
  budgetId,
  ...body
}: AddSavingsWithdrawalPayload): Promise<{ id: string }> {
  return apiClient.post(
    `/v1/monthly-budgets/${budgetId}/savings-withdrawals`,
    body
  )
}

export function useGetMonthlyBudgets() {
  return useQuery({
    queryKey: MONTHLY_BUDGETS_KEY,
    queryFn: fetchMonthlyBudgets,
  })
}

export function useGetMonthlyBudget(year: number, month: number) {
  return useQuery<MonthlyBudget | null>({
    queryKey: budgetByYearMonthKey(year, month),
    queryFn: () => fetchMonthlyBudget(year, month),
  })
}

export function useInitMonth() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: initMonth,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_KEY }),
  })
}

export function useDeleteMonthlyBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMonthlyBudget,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_KEY }),
  })
}

export function useUpdateSalary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSalary,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_KEY }),
  })
}

export function useAddActionPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addActionPayment,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_KEY }),
  })
}

export function useAddSavingsWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addSavingsWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_KEY })
      queryClient.invalidateQueries({ queryKey: ['savings'] })
    },
  })
}
