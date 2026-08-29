import { Trans, useLingui } from '@lingui/react/macro'
import { toast } from 'sonner'
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
import { useDeleteVehicle } from '../api/vehicles-api'
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
  const { mutate: deleteVehicle, isPending } = useDeleteVehicle()
  const { t } = useLingui()

  const handleDelete = () => {
    deleteVehicle(currentRow.id, {
      onSuccess: () => {
        toast.success(t`Véhicule supprimé.`)
        onOpenChange(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>Supprimer le véhicule</Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className='font-medium text-foreground'>
                {currentRow.name}
              </span>{' '}
              ? Cette action est irréversible et supprimera toutes les dépenses
              associées.
            </Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans>Annuler</Trans>
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
          >
            {isPending ? t`Suppression…` : t`Supprimer`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
