'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteContact, type DeleteContactResult } from '../api/contacts-api'
import { type Contact } from '../data/schema'

type ContactMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'SUPPRIMER'

function pluralize(count: number, singular: string, plural: string) {
  return count > 1 ? plural : singular
}

function summarizeDeleteResults(results: DeleteContactResult[]) {
  const hardDeletedCount = results.filter((r) => r.hardDeleted).length
  const hiddenCount = results.length - hardDeletedCount

  const parts: string[] = []
  if (hardDeletedCount > 0) {
    parts.push(
      `${hardDeletedCount} ${pluralize(hardDeletedCount, 'supprimé', 'supprimés')}`
    )
  }
  if (hiddenCount > 0) {
    parts.push(
      `${hiddenCount} ${pluralize(hiddenCount, 'masqué (historique conservé)', 'masqués (historique conservé)')}`
    )
  }
  return `${parts.join(', ')}.`
}

export function ContactsMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: ContactMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const deleteContact = useDeleteContact()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Veuillez taper "${CONFIRM_WORD}" pour confirmer.`)
      return
    }

    onOpenChange(false)

    const ids = selectedRows.map((row) => (row.original as Contact).id)

    toast.promise(Promise.all(ids.map((id) => deleteContact.mutateAsync(id))), {
      loading: 'Suppression en cours...',
      success: (results) => {
        setValue('')
        table.resetRowSelection()
        return summarizeDeleteResults(results)
      },
      error: 'Erreur lors de la suppression.',
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Supprimer {selectedRows.length} contact
          {selectedRows.length > 1 ? 's' : ''}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Êtes-vous sûr de vouloir supprimer les contacts sélectionnés ?{' '}
            <br />
            Cette action est irréversible.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>Confirmez en tapant &quot;{CONFIRM_WORD}&quot; :</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Tapez "${CONFIRM_WORD}" pour confirmer.`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Attention !</AlertTitle>
            <AlertDescription>
              Cette opération ne peut pas être annulée. Les contacts ayant
              des dettes ou dépenses associées seront masqués plutôt que
              supprimés pour garder l'historique lisible.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Supprimer'
      destructive
    />
  )
}
