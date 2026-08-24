import { Trans, useLingui } from '@lingui/react/macro'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ContactDuplicateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  fullName: string
  hidden: boolean
  onReactivate: () => void
  onCreateAnyway: () => void
}

export function ContactDuplicateDialog({
  open,
  onOpenChange,
  fullName,
  hidden,
  onReactivate,
  onCreateAnyway,
}: ContactDuplicateDialogProps) {
  const { t } = useLingui()
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hidden ? (
              <Trans>Un contact "{fullName}" existe déjà (masqué)</Trans>
            ) : (
              <Trans>Un contact "{fullName}" existe déjà</Trans>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hidden ? (
              <Trans>
                Vous aviez supprimé "{fullName}" — s'il s'agit de la même
                personne, réactivez-le pour garder son historique. Sinon, vous
                pouvez créer un nouveau contact distinct.
              </Trans>
            ) : (
              <Trans>
                Un contact nommé "{fullName}" existe déjà dans votre liste. Si
                c'est une personne différente, vous pouvez créer un nouveau
                contact quand même.
              </Trans>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t`Annuler`}</AlertDialogCancel>
          {hidden && (
            <AlertDialogAction onClick={onReactivate}>
              <Trans>Réactiver</Trans>
            </AlertDialogAction>
          )}
          <AlertDialogAction onClick={onCreateAnyway}>
            <Trans>Créer quand même</Trans>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
