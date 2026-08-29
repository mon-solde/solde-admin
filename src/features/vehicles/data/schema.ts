import { z } from 'zod'

const vehicleStatusSchema = z.union([z.literal('ACTIVE'), z.literal('SOLD')])

const vehicleParticipantSchema = z.object({
  contactId: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  profitShare: z.number().min(0).max(100),
})

export const vehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  purchaseDate: z.coerce.date(),
  purchasePrice: z.coerce.number(),
  status: vehicleStatusSchema,
  totalExpenses: z.coerce.number(),
  participants: z.array(vehicleParticipantSchema),
  ownerProfitShare: z.coerce.number().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Vehicle = z.infer<typeof vehicleSchema>

export const vehiclesPageSchema = z.object({
  data: z.array(vehicleSchema),
  count: z.number(),
  limit: z.number(),
  page: z.number(),
})
export type VehiclesPage = z.infer<typeof vehiclesPageSchema>

export const expensePayerSchema = z.object({
  payerId: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  amount: z.coerce.number().min(0),
  source: z.union([z.literal('BANK'), z.literal('CASH')]).nullable(),
  imputedToId: z.string().nullable().optional(),
  imputedToFirstName: z.string().nullable().optional(),
  imputedToLastName: z.string().nullable().optional(),
})
export type ExpensePayer = z.infer<typeof expensePayerSchema>

export const expenseSchema = z.object({
  id: z.string(),
  vehicleId: z.string().optional(),
  label: z.string(),
  date: z.coerce.date(),
  createdAt: z.coerce.date(),
  totalAmount: z.coerce.number().min(0),
  payers: z.array(expensePayerSchema),
})
export type Expense = z.infer<typeof expenseSchema>

export const vehicleEventSchema = z.object({
  id: z.string(),
  note: z.string(),
  createdAt: z.coerce.date(),
})
export type VehicleEvent = z.infer<typeof vehicleEventSchema>

const participantSummarySchema = z.object({
  contactId: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  profitShare: z.coerce.number(),
  totalInvested: z.coerce.number(),
  profitFromSale: z.coerce.number().nullable(),
  amountToReceive: z.coerce.number().nullable(),
})

const ownerSummarySchema = z.object({
  profitShare: z.coerce.number(),
  totalInvested: z.coerce.number(),
  profitFromSale: z.coerce.number().nullable(),
  amountToReceive: z.coerce.number().nullable(),
})

export const vehicleDetailSchema = vehicleSchema.extend({
  totalExpenses: z.coerce.number().optional().default(0),
  expenses: z.array(expenseSchema),
  events: z.array(vehicleEventSchema).default([]),
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
    owner: ownerSummarySchema,
    participants: z.array(participantSummarySchema),
  }),
})
export type VehicleDetail = z.infer<typeof vehicleDetailSchema>
