'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trans, useLingui } from '@lingui/react/macro'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteDette } from '../api/dettes-api'
import { type Dette } from '../data/schema'

type DettesMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function DettesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: DettesMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const deleteDette = useDeleteDette()
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

    const ids = selectedRows.map((row) => (row.original as Dette).id)

    toast.promise(Promise.all(ids.map((id) => deleteDette.mutateAsync(id))), {
      loading: t`Suppression en cours...`,
      success: () => {
        setValue('')
        table.resetRowSelection()
        return t`${ids.length} dette${ids.length > 1 ? 's' : ''} supprimée${ids.length > 1 ? 's' : ''}.`
      },
      error: (error) => getErrorMessage(error, t`Erreur`),
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
            Supprimer {selectedRows.length} dette
            {selectedRows.length > 1 ? 's' : ''}
          </Trans>
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            <Trans>
              Êtes-vous sûr de vouloir supprimer les dettes sélectionnées ?{' '}
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
              <Trans>Cette opération ne peut pas être annulée.</Trans>
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t`Supprimer`}
      destructive
    />
  )
}
