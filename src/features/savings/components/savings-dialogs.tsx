import { SavingsActionDialog } from './savings-action-dialog'
import { SavingsDeleteDialog } from './savings-delete-dialog'
import { useSavings } from './savings-provider'

export function SavingsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSavings()

  return (
    <>
      <SavingsActionDialog
        key='savings-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <SavingsDeleteDialog
          key={`savings-delete-${currentRow.id}`}
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
