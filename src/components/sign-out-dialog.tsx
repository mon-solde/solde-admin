import { useNavigate, useLocation } from '@tanstack/react-router'
import { useLingui } from '@lingui/react/macro'
import { signOut } from 'firebase/auth'
import { useAuthStore } from '@/stores/auth-store'
import { firebaseAuth } from '@/lib/firebase'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()
  const { t } = useLingui()

  const handleSignOut = async () => {
    // Without this, Firebase's own persisted session stays valid — the
    // route guard reads straight from Firebase, so typing a protected URL
    // after "signing out" would silently re-authenticate.
    await signOut(firebaseAuth)
    auth.reset()
    // Preserve current location for redirect after sign-in — pathname only,
    // never location.href, which could itself already carry a ?redirect=...
    // and nest one level deeper on every sign-out/sign-in cycle.
    const currentPath = location.pathname
    navigate({
      to: '/sign-in',
      search: { redirect: currentPath },
      replace: true,
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t`Se déconnecter`}
      desc={t`Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.`}
      confirmText={t`Se déconnecter`}
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
