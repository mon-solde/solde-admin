import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const SAVINGS_KEY = ['savings'] as const

// Single source of truth for "how many rows per page by default" — reused
// by useTableUrlState (features/savings/index.tsx) so the table's resolved
// page size and the value actually sent to the backend can never disagree.
export const DEFAULT_PAGE_SIZE = 10

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

const savingsPageSchema = z.object({
  balances: z.object({ bank: z.number(), cash: z.number(), total: z.number() }),
  data: z.array(savingsHistoryItemSchema),
  count: z.number(),
  limit: z.number(),
  page: z.number(),
})

type SavingsPage = z.infer<typeof savingsPageSchema>

type SavingsFilters = {
  kind?: 'addition' | 'withdrawal' | 'tous'
  source?: 'bank' | 'cash' | 'tous'
  search?: string
  pageIndex?: number
  pageSize?: number
  sortBy?: 'date' | 'amount'
  sortOrder?: 'asc' | 'desc'
}

async function fetchSavings(
  filters: SavingsFilters = {}
): Promise<SavingsPage> {
  const { kind, source, search, pageIndex, pageSize, sortBy, sortOrder } =
    filters
  const params: Record<string, string | number> = {}
  if (kind && kind !== 'tous') params.kind = kind.toUpperCase()
  if (source && source !== 'tous') params.source = source.toUpperCase()
  if (search) params.search = search
  params.page = pageIndex ?? 0
  params.limit = pageSize ?? DEFAULT_PAGE_SIZE
  if (sortBy) params.sortBy = sortBy
  if (sortOrder) params.sortOrder = sortOrder

  const data = await apiClient.get('/v1/savings/events', { params })
  return savingsPageSchema.parse(data)
}

type CreateSavingsEventPayload = {
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

export function useGetSavings(filters: SavingsFilters = {}) {
  const { kind, source, search, pageIndex, pageSize, sortBy, sortOrder } =
    filters
  return useQuery({
    queryKey: [
      ...SAVINGS_KEY,
      kind ?? '',
      source ?? '',
      search ?? '',
      pageIndex ?? 0,
      pageSize ?? DEFAULT_PAGE_SIZE,
      sortBy ?? '',
      sortOrder ?? '',
    ],
    queryFn: () =>
      fetchSavings({
        kind,
        source,
        search,
        pageIndex,
        pageSize,
        sortBy,
        sortOrder,
      }),
  })
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
