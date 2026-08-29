import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '@/features/auth/components/auth-guard'

export const Route = createFileRoute('/_authenticated')({
  component: AuthGuard,
})
