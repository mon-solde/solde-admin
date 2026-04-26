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

  const handleDelete = () => {
    deleteVehicle(currentRow.id, {
      onSuccess: () => {
        toast.success('Véhicule supprimé.')
        onOpenChange(false)
      },
      onError: (error: any) =>
        toast.error(
          error?.response?.data?.message ?? 'Une erreur est survenue.'
        ),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le véhicule</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer{' '}
            <span className='font-medium text-foreground'>
              {currentRow.name}
            </span>{' '}
            ? Cette action est irréversible et supprimera toutes les dépenses
            associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
          >
            {isPending ? 'Suppression…' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
