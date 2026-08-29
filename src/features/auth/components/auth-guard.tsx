import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from '@tanstack/react-router'
import { onAuthStateChanged } from 'firebase/auth'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { firebaseAuth } from '@/lib/firebase'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export function AuthGuard() {
  const [status, setStatus] = useState<'loading' | 'authed' | 'guest'>(
    'loading'
  )
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
    // `auth`'s setters return a new object from the store on every call
    // (setUser/setAccessToken/reset), so adding it here would resubscribe
    // this effect — and re-trigger Firebase's immediate initial callback —
    // every time auth state changes, looping. The listener only needs to be
    // set up once; `auth`'s actions are stable enough for that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading') {
    return (
      <div className='flex h-svh items-center justify-center'>
        <Loader2 className='animate-spin text-muted-foreground' size={32} />
      </div>
    )
  }

  if (status === 'guest') {
    // pathname only, never location.href — href can itself already carry a
    // ?redirect=... from a previous bounce, which would nest one level
    // deeper on every redirect instead of ever resolving.
    return (
      <Navigate
        to='/sign-in'
        search={{ redirect: location.pathname }}
        replace
      />
    )
  }

  return (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  )
}
