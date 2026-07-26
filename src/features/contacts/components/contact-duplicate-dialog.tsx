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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Un contact "{fullName}" existe déjà
            {hidden ? ' (masqué)' : ''}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hidden
              ? `Vous aviez supprimé "${fullName}" — s'il s'agit de la même personne, réactivez-le pour garder son historique. Sinon, vous pouvez créer un nouveau contact distinct.`
              : `Un contact nommé "${fullName}" existe déjà dans votre liste. Si c'est une personne différente, vous pouvez créer un nouveau contact quand même.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          {hidden && (
            <AlertDialogAction onClick={onReactivate}>
              Réactiver
            </AlertDialogAction>
          )}
          <AlertDialogAction onClick={onCreateAnyway}>
            Créer quand même
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
