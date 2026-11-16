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
import { type SavingsHistoryEntry } from '../data/data'
import { getSavingsEntryLabel } from '../data/labels'
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
  const { deleteMovement, isDeletingMovement } = useSavings()
  const { t, i18n } = useLingui()

  function handleDelete() {
    deleteMovement(currentRow.id, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Supprimer le mouvement</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className='font-medium text-foreground'>
                {getSavingsEntryLabel(currentRow.details, i18n.locale)}
              </span>{' '}
              ? Cette action est irréversible.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Annuler</Trans>
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeletingMovement}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
          >
            {isDeletingMovement ? t`Suppression…` : t`Supprimer`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
