import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Contacts } from '@/features/contacts'

const contactsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
  sortBy: z.enum(['fullName', 'createdAt']).optional().catch(undefined),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/contacts/')({
  validateSearch: contactsSearchSchema,
  component: Contacts,
})
