import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { contactSchema, type Contact } from '../data/schema'

const CONTACTS_KEY = ['contacts'] as const

async function fetchContacts(): Promise<Contact[]> {
  const data = await apiClient.get('/v1/contacts')
  return z.array(contactSchema).parse(data)
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

export function useGetContacts() {
  return useQuery({
    queryKey: CONTACTS_KEY,
    queryFn: fetchContacts,
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
