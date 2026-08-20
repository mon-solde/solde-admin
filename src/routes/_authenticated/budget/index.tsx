import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { BudgetList } from '@/features/budget/budget-list'

const budgetListSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  sortBy: z.enum(['month', 'receivedSalary']).optional().catch(undefined),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/budget/')({
  validateSearch: budgetListSearchSchema,
  component: BudgetList,
})
