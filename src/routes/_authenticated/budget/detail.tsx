import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Budget } from '@/features/budget'

const budgetDetailSearchSchema = z.object({
  year: z.number().optional(),
  month: z.number().min(1).max(12).optional(),
})

export const Route = createFileRoute('/_authenticated/budget/detail')({
  validateSearch: budgetDetailSearchSchema,
  component: Budget,
})
