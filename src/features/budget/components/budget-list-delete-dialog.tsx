import { ConfirmDialog } from '@/components/confirm-dialog'
import { FRENCH_MONTHS } from '../data/data'
import { type MonthlyBudget } from '../data/schema'
import { useBudgetList } from './budget-list-provider'

type BudgetListDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: MonthlyBudget
}

export function BudgetListDeleteDialog({ open, onOpenChange, currentRow }: BudgetListDeleteDialogProps) {
  const { deleteBudget } = useBudgetList()

  function handleDelete() {
    deleteBudget(currentRow.id)
    onOpenChange(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
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
