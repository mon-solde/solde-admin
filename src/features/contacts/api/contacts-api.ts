import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { contactsPageSchema, type ContactsPage } from '../data/schema'

const CONTACTS_KEY = ['contacts'] as const

// Single source of truth for "how many rows per page by default" — reused
// by useTableUrlState (features/contacts/index.tsx) so the table's
// resolved page size and the value actually sent to the backend can never
// disagree.
export const DEFAULT_PAGE_SIZE = 10

export type ContactsFilters = {
  search?: string
  pageIndex?: number
  pageSize?: number
  sortBy?: 'fullName' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

async function fetchContacts(
  filters: ContactsFilters = {}
): Promise<ContactsPage> {
  const { search, pageIndex, pageSize, sortBy, sortOrder } = filters
  const params: Record<string, string | number> = {}
  if (search) params.search = search
  params.page = pageIndex ?? 0
  params.limit = pageSize ?? DEFAULT_PAGE_SIZE
  if (sortBy) params.sortBy = sortBy
  if (sortOrder) params.sortOrder = sortOrder

  const data = await apiClient.get('/v1/contacts', { params })
  return contactsPageSchema.parse(data)
}

export type CreateContactPayload = {
  firstName: string
  lastName?: string
  skipDuplicateNameCheck?: boolean
}

async function createContact(
  payload: CreateContactPayload
): Promise<{ id: string }> {
  return apiClient.post('/v1/contacts', payload)
}

export type UpdateContactPayload = {
  id: string
  firstName: string
  lastName?: string
}

async function updateContact({
  id,
  ...body
}: UpdateContactPayload): Promise<void> {
  return apiClient.put(`/v1/contacts/${id}`, body)
}

export type DeleteContactResult = { hardDeleted: boolean }

async function deleteContact(id: string): Promise<DeleteContactResult> {
  return apiClient.delete(`/v1/contacts/${id}`)
}

async function reactivateContact(id: string): Promise<void> {
  return apiClient.patch(`/v1/contacts/${id}/reactivate`)
}

export function useGetContacts(filters: ContactsFilters = {}) {
  const { search, pageIndex, pageSize, sortBy, sortOrder } = filters
  return useQuery({
    queryKey: [
      ...CONTACTS_KEY,
      search ?? '',
      pageIndex ?? 0,
      pageSize ?? DEFAULT_PAGE_SIZE,
      sortBy ?? '',
      sortOrder ?? '',
    ],
    queryFn: () =>
      fetchContacts({ search, pageIndex, pageSize, sortBy, sortOrder }),
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}

export function useReactivateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reactivateContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}
