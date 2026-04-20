import { z } from 'zod'

const vehicleStatusSchema = z.union([z.literal('active'), z.literal('sold')])
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>

const vehicleParticipantSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  profitShare: z.number().min(0).max(100),
})
export type VehicleParticipant = z.infer<typeof vehicleParticipantSchema>

const _vehicleSchema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  purchaseDate: z.coerce.date(),
  status: vehicleStatusSchema,
  salePrice: z.number().optional(),
  soldAt: z.coerce.date().optional(),
  participants: z.array(vehicleParticipantSchema),
  createdAt: z.coerce.date(),
})
export type Vehicle = z.infer<typeof _vehicleSchema>

const expensePayerSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  amount: z.number().min(0),
})
export type ExpensePayer = z.infer<typeof expensePayerSchema>

const _expenseSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  label: z.string(),
  date: z.coerce.date(),
  totalAmount: z.number().min(0),
  payers: z.array(expensePayerSchema),
})
export type Expense = z.infer<typeof _expenseSchema>
