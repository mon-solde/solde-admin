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
import { useDeleteRecurringCharge } from '../api/subscriptions-api'
import { type Subscription } from '../data/schema'

type SubscriptionsDeleteDialogProps = {
  currentRow: Subscription
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionsDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: SubscriptionsDeleteDialogProps) {
  const { mutate: deleteCharge, isPending } = useDeleteRecurringCharge()

  function handleDelete() {
    deleteCharge(currentRow.id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la charge récurrente</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer{' '}
            <span className='font-medium text-foreground'>
              {currentRow.name}
            </span>{' '}
            ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
