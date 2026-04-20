import { BudgetListActionDialog } from './budget-list-action-dialog'
import { BudgetListDeleteDialog } from './budget-list-delete-dialog'
import { useBudgetList } from './budget-list-provider'

export function BudgetListDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useBudgetList()
  return (
    <>
      <BudgetListActionDialog
        key='budget-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <BudgetListDeleteDialog
          key={`budget-delete-${currentRow.id}`}
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => setCurrentRow(null), 500)
          }}
          currentRow={currentRow}
        />
      )}
    </>
  )
}
