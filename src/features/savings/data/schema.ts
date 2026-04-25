import { z } from 'zod'

export const savingsMovementKindSchema = z.enum(['addition', 'withdrawal'])
export type SavingsMovementKind = z.infer<typeof savingsMovementKindSchema>

export const savingsMovementSourceSchema = z.enum(['bank', 'cash'])
export type SavingsMovementSource = z.infer<typeof savingsMovementSourceSchema>
