'use client'

import { useState } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'
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
  const { t } = useLingui()

  const fullName = `${currentRow.firstName} ${currentRow.lastName ?? ''}`.trim()

  const handleDelete = () => {
    if (value.trim() !== fullName) return

    deleteContact.mutate(currentRow.id, {
      onSuccess: ({ hardDeleted }) => {
        toast.success(
          hardDeleted
            ? t`Contact supprimé.`
            : t`Contact masqué : il a des dettes ou dépenses associées, son historique est conservé.`
        )
        onOpenChange(false)
        setValue('')
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
          <Trans>Supprimer ce contact</Trans>
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            <Trans>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className='font-bold'>{fullName}</span> ?<br />
              Cette action est irréversible. S'il a des dettes ou dépenses
              associées, il sera masqué plutôt que supprimé pour garder
              l'historique lisible.
            </Trans>
          </p>

          <Label className='my-2'>
            <Trans>Nom complet :</Trans>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t`Entrez le nom complet pour confirmer.`}
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
