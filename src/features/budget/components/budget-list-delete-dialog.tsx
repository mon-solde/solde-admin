import { Trans, useLingui } from '@lingui/react/macro'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteMonthlyBudget } from '../api/budget-api'
import { MONTH_MESSAGES } from '../data/data'
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
  const { i18n, t } = useLingui()

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
      title={t`Supprimer ce mois`}
      desc={
        <p>
          <Trans>
            Êtes-vous sûr de vouloir supprimer le budget de{' '}
            <span className='font-bold'>
              {i18n._(MONTH_MESSAGES[currentRow.month - 1])} {currentRow.year}
            </span>{' '}
            ? Cette action est irréversible.
          </Trans>
        </p>
      }
      confirmText={t`Supprimer`}
      destructive
    />
  )
}
