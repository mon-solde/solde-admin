import { z } from 'zod'

export const vehicleStatusSchema = z.union([
  z.literal('ACTIVE'),
  z.literal('SOLD'),
])
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>

export const vehicleParticipantSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  profitShare: z.number().min(0).max(100),
})
export type VehicleParticipant = z.infer<typeof vehicleParticipantSchema>

export const vehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  purchaseDate: z.coerce.date(),
  purchasePrice: z.coerce.number(),
  status: vehicleStatusSchema,
  totalExpenses: z.coerce.number(),
  participants: z.array(vehicleParticipantSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Vehicle = z.infer<typeof vehicleSchema>

export const expensePayerSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  amount: z.coerce.number().min(0),
})
export type ExpensePayer = z.infer<typeof expensePayerSchema>

export const expenseSchema = z.object({
  id: z.string(),
  vehicleId: z.string().optional(),
  label: z.string(),
  date: z.coerce.date(),
  totalAmount: z.coerce.number().min(0),
  payers: z.array(expensePayerSchema),
})
export type Expense = z.infer<typeof expenseSchema>

export const participantSummarySchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  profitShare: z.coerce.number(),
  totalInvested: z.coerce.number(),
  profitFromSale: z.coerce.number().nullable(),
  amountToReceive: z.coerce.number().nullable(),
})
export type ParticipantSummary = z.infer<typeof participantSummarySchema>

export const reversementRepaymentSchema = z.object({
  id: z.string(),
  amount: z.coerce.number(),
  date: z.coerce.date(),
  note: z.string().nullable().optional(),
})

export const reversementSchema = z.object({
  debtId: z.string(),
  recipientId: z.string(),
  recipientFirstName: z.string(),
  recipientLastName: z.string(),
  amountDue: z.coerce.number(),
  amountPaid: z.coerce.number(),
  remaining: z.coerce.number(),
  isSettled: z.boolean(),
  repayments: z.array(reversementRepaymentSchema).default([]),
})
export type Reversement = z.infer<typeof reversementSchema>

export const vehicleDetailSchema = vehicleSchema.extend({
  totalExpenses: z.coerce.number().optional().default(0),
  expenses: z.array(expenseSchema),
  soldVehicle: z
    .object({
      salePrice: z.coerce.number(),
      soldAt: z.coerce.date(),
      cashierId: z.string(),
    })
    .nullable(),
  financialSummary: z.object({
    totalExpenses: z.coerce.number(),
    profit: z.coerce.number().nullable(),
    cashierId: z.string().nullable(),
    participants: z.array(participantSummarySchema),
  }),
  reversements: z.array(reversementSchema).default([]),
})
export type VehicleDetail = z.infer<typeof vehicleDetailSchema>
