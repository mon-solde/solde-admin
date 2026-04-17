import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { type Vehicle } from '../data/schema'

type VehiclesDeleteDialogProps = {
  currentRow: Vehicle
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VehiclesDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: VehiclesDeleteDialogProps) {
  const handleDelete = () => {
    onOpenChange(false)
    // appel API ici plus tard
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le véhicule</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer{' '}
            <span className='font-medium text-foreground'>
              {currentRow.make} {currentRow.model} ({currentRow.year})
            </span>{' '}
            ? Cette action est irréversible et supprimera toutes les dépenses associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
