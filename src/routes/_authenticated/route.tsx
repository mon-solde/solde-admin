import { createFileRoute, redirect } from '@tanstack/react-router'
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
  component: AuthenticatedLayout,
})
