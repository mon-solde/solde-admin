import { useEffect, useState } from 'react'
import { createFileRoute, Navigate, Outlet, useLocation } from '@tanstack/react-router'
import { onAuthStateChanged } from 'firebase/auth'
import { Loader2 } from 'lucide-react'
import { firebaseAuth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

function AuthGuard() {
  const [status, setStatus] = useState<'loading' | 'authed' | 'guest'>('loading')
  const { auth } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    // Wait for auth state to be resolved from localStorage before subscribing,
    // otherwise onAuthStateChanged may fire with null before the user is loaded
    firebaseAuth.authStateReady().then(() => {
      unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          const idToken = await user.getIdToken()
          auth.setAccessToken(idToken)
          auth.setUser({
            accountNo: user.uid,
            email: user.email!,
            role: ['user'],
            exp: Date.now() + 60 * 60 * 1000,
          })
          setStatus('authed')
        } else {
          auth.reset()
          setStatus('guest')
        }
      })
    })

    return () => unsubscribe?.()
  }, [])

  if (status === 'loading') {
    return (
      <div className='flex h-svh items-center justify-center'>
        <Loader2 className='animate-spin text-muted-foreground' size={32} />
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to='/sign-in' search={{ redirect: location.href }} replace />
  }

  return <AuthenticatedLayout><Outlet /></AuthenticatedLayout>
}

export const Route = createFileRoute('/_authenticated')({
  component: AuthGuard,
})
