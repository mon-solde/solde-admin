import { z } from 'zod'

export const repaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  date: z.coerce.date(),
  note: z.string().optional(),
})

export type Repayment = z.infer<typeof repaymentSchema>

export const detteSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lenderId: z.string(),
  borrowerId: z.string(),
  lenderName: z.string(),
  borrowerName: z.string(),
  role: z.enum(['lent', 'borrowed']).default('lent'),
  amount: z.number(),
  date: z.coerce.date(),
  description: z.string().optional(),
  totalRepaid: z.number(),
  remaining: z.number(),
  isRepaid: z.boolean(),
  repayments: z.array(repaymentSchema).default([]),
})

export type Dette = z.infer<typeof detteSchema>
