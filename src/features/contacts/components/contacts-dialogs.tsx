import { ContactsActionDialog } from './contacts-action-dialog'
import { ContactsDeleteDialog } from './contacts-delete-dialog'
import { useContacts } from './contacts-provider'

export function ContactsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useContacts()

  // Closes (or toggles) a dialog, then clears `currentRow` once its exit
  // animation has had time to finish — clearing it immediately would blank
  // the dialog's content while it's still visibly closing.
  const closeDialog = (key: Parameters<typeof setOpen>[0] = null) => {
    setOpen(key)
    setTimeout(() => setCurrentRow(null), 500)
  }

  return (
    <>
      <ContactsActionDialog
        key='contact-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <ContactsActionDialog
            key={`contact-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => closeDialog('edit')}
            currentRow={currentRow}
          />

          <ContactsDeleteDialog
            key={`contact-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => closeDialog('delete')}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
