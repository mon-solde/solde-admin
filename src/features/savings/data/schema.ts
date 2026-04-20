import { z } from 'zod'

const savingsMovementKindSchema = z.union([
  z.literal('addition'),
  z.literal('withdrawal'),
])
export type SavingsMovementKind = z.infer<typeof savingsMovementKindSchema>

const savingsMovementSourceSchema = z.union([
  z.literal('bank'),
  z.literal('cash'),
])
export type SavingsMovementSource = z.infer<typeof savingsMovementSourceSchema>

const savingsMovementSchema = z.object({
  id: z.string(),
  kind: savingsMovementKindSchema,
  source: savingsMovementSourceSchema,
  amount: z.number(),
  label: z.string(),
  movementDate: z.coerce.date(),
  createdAt: z.coerce.date(),
})
export type SavingsMovement = z.infer<typeof savingsMovementSchema>
