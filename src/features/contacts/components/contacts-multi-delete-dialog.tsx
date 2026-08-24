'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Trans, useLingui } from '@lingui/react/macro'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { plural } from '@lingui/core/macro'
import { useDeleteContact, type DeleteContactResult } from '../api/contacts-api'
import { type Contact } from '../data/schema'

type ContactMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

function summarizeDeleteResults(results: DeleteContactResult[]) {
  const hardDeletedCount = results.filter((r) => r.hardDeleted).length
  const hiddenCount = results.length - hardDeletedCount

  const parts: string[] = []
  if (hardDeletedCount > 0) {
    parts.push(
      plural(hardDeletedCount, { one: '# supprimé', other: '# supprimés' })
    )
  }
  if (hiddenCount > 0) {
    parts.push(
      plural(hiddenCount, {
        one: '# masqué (historique conservé)',
        other: '# masqués (historique conservé)',
      })
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
  const { t } = useLingui()
  // The word the user must retype to confirm — translated too, so an
  // English-speaking user isn't asked to type a French word.
  const confirmWord = t`SUPPRIMER`

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== confirmWord) {
      toast.error(t`Veuillez taper "${confirmWord}" pour confirmer.`)
      return
    }

    onOpenChange(false)

    const ids = selectedRows.map((row) => (row.original as Contact).id)

    toast.promise(Promise.all(ids.map((id) => deleteContact.mutateAsync(id))), {
      loading: t`Suppression en cours...`,
      success: (results) => {
        setValue('')
        table.resetRowSelection()
        return summarizeDeleteResults(results)
      },
      error: t`Erreur lors de la suppression.`,
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== confirmWord}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          <Trans>
            Supprimer {selectedRows.length} contact
            {selectedRows.length > 1 ? 's' : ''}
          </Trans>
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            <Trans>
              Êtes-vous sûr de vouloir supprimer les contacts sélectionnés ?{' '}
              <br />
              Cette action est irréversible.
            </Trans>
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>
              <Trans>Confirmez en tapant &quot;{confirmWord}&quot; :</Trans>
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t`Tapez "${confirmWord}" pour confirmer.`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>
              <Trans>Attention !</Trans>
            </AlertTitle>
            <AlertDescription>
              <Trans>
                Cette opération ne peut pas être annulée. Les contacts ayant
                des dettes ou dépenses associées seront masqués plutôt que
                supprimés pour garder l'historique lisible.
              </Trans>
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t`Supprimer`}
      destructive
    />
  )
}
