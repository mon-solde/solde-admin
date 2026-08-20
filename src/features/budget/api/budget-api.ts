import { isAxiosError } from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  monthlyBudgetSchema,
  monthlyBudgetsPageSchema,
  type MonthlyBudget,
  type MonthlyBudgetsPage,
  type SavingsDestination,
} from '../data/schema'

const MONTHLY_BUDGETS_KEY = ['monthly-budgets'] as const

function budgetByYearMonthKey(year: number, month: number) {
  return [...MONTHLY_BUDGETS_KEY, year, month] as const
}

// Single source of truth for "how many rows per page by default" — reused
// by useTableUrlState (features/budget/budget-list.tsx) so the table's
// resolved page size and the value actually sent to the backend can never
// disagree.
export const DEFAULT_PAGE_SIZE = 10

export type MonthlyBudgetsFilters = {
  pageIndex?: number
  pageSize?: number
  sortBy?: 'month' | 'receivedSalary'
  sortOrder?: 'asc' | 'desc'
}

async function fetchMonthlyBudgets(
  filters: MonthlyBudgetsFilters = {}
): Promise<MonthlyBudgetsPage> {
  const { pageIndex, pageSize, sortBy, sortOrder } = filters
  const params: Record<string, string | number> = {}
  params.page = pageIndex ?? 0
  params.limit = pageSize ?? DEFAULT_PAGE_SIZE
  if (sortBy) params.sortBy = sortBy
  if (sortOrder) params.sortOrder = sortOrder

  const data = await apiClient.get('/v1/monthly-budgets', { params })
  return monthlyBudgetsPageSchema.parse(data)
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

export type AddRecurringChargeToBudgetPayload = {
  budgetId: string
  recurringChargeId: string
}

async function addRecurringChargeToBudget({
  budgetId,
  recurringChargeId,
}: AddRecurringChargeToBudgetPayload): Promise<{ id: string }> {
  return apiClient.post(`/v1/monthly-budgets/${budgetId}/recurring-charges`, {
    recurringChargeId,
  })
}

export function useGetMonthlyBudgets(filters: MonthlyBudgetsFilters = {}) {
  const { pageIndex, pageSize, sortBy, sortOrder } = filters
  return useQuery({
    queryKey: [
      ...MONTHLY_BUDGETS_KEY,
      pageIndex ?? 0,
      pageSize ?? DEFAULT_PAGE_SIZE,
      sortBy ?? '',
      sortOrder ?? '',
    ],
    queryFn: () => fetchMonthlyBudgets({ pageIndex, pageSize, sortBy, sortOrder }),
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

export function useAddRecurringChargeToBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addRecurringChargeToBudget,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_KEY }),
  })
}
