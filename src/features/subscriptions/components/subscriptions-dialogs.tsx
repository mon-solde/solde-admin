import { SubscriptionsActionDialog } from './subscriptions-action-dialog'
import { SubscriptionsDeleteDialog } from './subscriptions-delete-dialog'
import { useSubscriptions } from './subscriptions-provider'

export function SubscriptionsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSubscriptions()

  // Closes (or toggles) a dialog, then clears `currentRow` once its exit
  // animation has had time to finish — clearing it immediately would blank
  // the dialog's content while it's still visibly closing.
  const closeDialog = (key: Parameters<typeof setOpen>[0] = null) => {
    setOpen(key)
    setTimeout(() => setCurrentRow(null), 500)
  }

  return (
    <>
      <SubscriptionsActionDialog
        key='subscription-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <SubscriptionsActionDialog
          key={`subscription-edit-${currentRow.id}`}
          currentRow={currentRow}
          open={open === 'edit'}
          onOpenChange={() => closeDialog('edit')}
        />
      )}

      {currentRow && (
        <SubscriptionsDeleteDialog
          key={`subscription-delete-${currentRow.id}`}
          open={open === 'delete'}
          onOpenChange={() => closeDialog('delete')}
          currentRow={currentRow}
        />
      )}
    </>
  )
}
