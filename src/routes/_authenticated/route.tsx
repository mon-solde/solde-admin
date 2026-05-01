import { createFileRoute, redirect } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { firebaseAuth } from '@/lib/firebase'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    await firebaseAuth.authStateReady()
    if (!firebaseAuth.currentUser) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
  },
  pendingComponent: () => (
    <div className='flex h-svh items-center justify-center'>
      <Loader2 className='animate-spin text-muted-foreground' size={32} />
    </div>
  ),
  pendingMs: 0,
  component: AuthenticatedLayout,
})
