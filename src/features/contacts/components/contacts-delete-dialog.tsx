'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteContact } from '../api/contacts-api'
import { type Contact } from '../data/schema'

type ContactDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Contact
}

export function ContactsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ContactDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteContact = useDeleteContact()

  const fullName = `${currentRow.firstName} ${currentRow.lastName ?? ''}`.trim()

  const handleDelete = () => {
    if (value.trim() !== fullName) return

    deleteContact.mutate(currentRow.id, {
      onSuccess: ({ hardDeleted }) => {
        toast.success(
          hardDeleted
            ? 'Contact supprimé.'
            : 'Contact masqué : il a des dettes ou dépenses associées, son historique est conservé.'
        )
        onOpenChange(false)
        setValue('')
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ??
            'Impossible de supprimer ce contact.'
        )
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== fullName}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Supprimer ce contact
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Êtes-vous sûr de vouloir supprimer{' '}
            <span className='font-bold'>{fullName}</span> ?<br />
            Cette action est irréversible. S'il a des dettes ou dépenses
            associées, il sera masqué plutôt que supprimé pour garder
            l'historique lisible.
          </p>

          <Label className='my-2'>
            Nom complet :
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Entrez le nom complet pour confirmer.'
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
