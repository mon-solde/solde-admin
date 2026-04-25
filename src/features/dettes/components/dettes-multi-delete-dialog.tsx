'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

type DettesMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'SUPPRIMER'

export function DettesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: DettesMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Veuillez taper "${CONFIRM_WORD}" pour confirmer.`)
      return
    }

    onOpenChange(false)

    toast.promise(sleep(2000), {
      loading: 'Suppression en cours...',
      success: () => {
        setValue('')
        table.resetRowSelection()
        return `${selectedRows.length} dette${selectedRows.length > 1 ? 's' : ''} supprimée${selectedRows.length > 1 ? 's' : ''}.`
      },
      error: 'Erreur',
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
          Supprimer {selectedRows.length} dette
          {selectedRows.length > 1 ? 's' : ''}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Êtes-vous sûr de vouloir supprimer les dettes sélectionnées ? <br />
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
              Cette opération ne peut pas être annulée.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Supprimer'
      destructive
    />
  )
}
