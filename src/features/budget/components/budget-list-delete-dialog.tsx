import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteMonthlyBudget } from '../api/budget-api'
import { FRENCH_MONTHS } from '../data/data'
import { type MonthlyBudget } from '../data/schema'
import { useBudgetList } from './budget-list-provider'

type BudgetListDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: MonthlyBudget
}

export function BudgetListDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: BudgetListDeleteDialogProps) {
  const { setCurrentRow } = useBudgetList()
  const { mutate: deleteBudget, isPending } = useDeleteMonthlyBudget()

  function handleDelete() {
    deleteBudget(currentRow.id, {
      onSuccess: () => {
        onOpenChange(false)
        setCurrentRow(null)
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      isLoading={isPending}
      title='Supprimer ce mois'
      desc={
        <p>
          Êtes-vous sûr de vouloir supprimer le budget de{' '}
          <span className='font-bold'>
            {FRENCH_MONTHS[currentRow.month - 1]} {currentRow.year}
          </span>{' '}
          ? Cette action est irréversible.
        </p>
      }
      confirmText='Supprimer'
      destructive
    />
  )
}
