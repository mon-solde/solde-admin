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
import { type SavingsHistoryEntry } from '../data/data'
import { useSavings } from './savings-provider'

type SavingsDeleteDialogProps = {
  currentRow: SavingsHistoryEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SavingsDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: SavingsDeleteDialogProps) {
  const { deleteMovement } = useSavings()

  function handleDelete() {
    deleteMovement(currentRow.id, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le mouvement</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer{' '}
            <span className='font-medium text-foreground'>
              {currentRow.label}
            </span>{' '}
            ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
