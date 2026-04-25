import { SubscriptionsActionDialog } from './subscriptions-action-dialog'
import { SubscriptionsDeleteDialog } from './subscriptions-delete-dialog'
import { useSubscriptions } from './subscriptions-provider'

export function SubscriptionsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSubscriptions()

  return (
    <>
      <SubscriptionsActionDialog
        key='subscription-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <SubscriptionsDeleteDialog
          key={`subscription-delete-${currentRow.id}`}
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
