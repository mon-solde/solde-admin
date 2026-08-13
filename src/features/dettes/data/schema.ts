import { z } from 'zod'

export const repaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  date: z.coerce.date(),
  note: z.string().optional(),
  source: z.enum(['BANK', 'CASH']),
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
  amount: z.coerce.number(),
  date: z.coerce.date(),
  type: z.enum(['MANUAL', 'SOLD_VEHICLE', 'EXPENSE']).default('MANUAL'),
  description: z.string().optional(),
  vehicleId: z.string().optional(),
  vehicleName: z.string().optional(),
  totalRepaid: z.coerce.number(),
  remaining: z.coerce.number(),
  isRepaid: z.boolean(),
  repayments: z.array(repaymentSchema).default([]),
})

export type Dette = z.infer<typeof detteSchema>
