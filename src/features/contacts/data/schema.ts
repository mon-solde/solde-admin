import { z } from 'zod'

export const contactSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  firstName: z.string(),
  lastName: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Contact = z.infer<typeof contactSchema>
