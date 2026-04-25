import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const userSearchResultSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
})

export type UserSearchResult = z.infer<typeof userSearchResultSchema>

async function searchUsers(name: string): Promise<UserSearchResult[]> {
  const data = await apiClient.get('/v1/users', { params: { name } })
  return z.array(userSearchResultSchema).parse(data.data)
}

export function useSearchUsers(name: string) {
  return useQuery({
    queryKey: ['users', 'search', name],
    queryFn: () => searchUsers(name),
    enabled: name.length >= 2,
  })
}
