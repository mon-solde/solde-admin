'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  useCreateContact,
  useReactivateContact,
  useUpdateContact,
} from '../api/contacts-api'
import { type Contact } from '../data/schema'
import { ContactDuplicateDialog } from './contact-duplicate-dialog'

const formSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis.'),
  lastName: z.string().optional(),
})
type ContactForm = z.infer<typeof formSchema>

type ContactActionDialogProps = {
  currentRow?: Contact
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ContactActionDialogProps) {
  const isEdit = !!currentRow
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const reactivateContact = useReactivateContact()
  const [duplicate, setDuplicate] = useState<{
    existingContactId: string
    hidden: boolean
    fullName: string
    payload: { firstName: string; lastName?: string }
  } | null>(null)

  const form = useForm<ContactForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          firstName: currentRow.firstName,
          lastName: currentRow.lastName ?? '',
        }
      : {
          firstName: '',
          lastName: '',
        },
  })

  const isPending =
    createContact.isPending ||
    updateContact.isPending ||
    reactivateContact.isPending

  const onCreateSuccess = () => {
    toast.success('Contact ajouté.')
    form.reset()
    setDuplicate(null)
    onOpenChange(false)
  }

  const onSubmit = (values: ContactForm) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName || undefined,
    }

    if (currentRow) {
      updateContact.mutate(
        { id: currentRow.id, ...payload },
        {
          onSuccess: () => {
            toast.success('Contact modifié.')
            form.reset()
            onOpenChange(false)
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message ?? 'Une erreur est survenue.'
            )
          },
        }
      )
      return
    }

    createContact.mutate(payload, {
      onSuccess: onCreateSuccess,
      onError: (error: any) => {
        const existingContactId = error?.response?.data?.existingContactId
        if (existingContactId) {
          setDuplicate({
            existingContactId,
            hidden: error.response.data.hidden,
            fullName: `${payload.firstName} ${payload.lastName ?? ''}`.trim(),
            payload,
          })
          return
        }
        toast.error(
          error?.response?.data?.message ?? 'Une erreur est survenue.'
        )
      },
    })
  }

  const handleReactivate = () => {
    if (!duplicate) return
    reactivateContact.mutate(duplicate.existingContactId, {
      onSuccess: () => {
        toast.success(`"${duplicate.fullName}" a été réactivé.`)
        form.reset()
        setDuplicate(null)
        onOpenChange(false)
      },
    })
  }

  const handleCreateAnyway = () => {
    if (!duplicate) return
    createContact.mutate(
      { ...duplicate.payload, skipDuplicateNameCheck: true },
      { onSuccess: onCreateSuccess }
    )
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(state) => {
          form.reset()
          onOpenChange(state)
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader className='text-start'>
            <DialogTitle>
              {isEdit ? 'Modifier le contact' : 'Ajouter un contact'}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Modifiez le contact ici. '
                : 'Créez un nouveau contact ici. '}
              Cliquez sur enregistrer une fois terminé.
            </DialogDescription>
          </DialogHeader>
          <div className='w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
            <Form {...form}>
              <form
                id='contact-form'
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4 px-0.5'
              >
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Prénom
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Jean'
                          className='col-span-4'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Nom{' '}
                        <span className='font-normal text-muted-foreground'>
                          (optionnel)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Dupont'
                          className='col-span-4'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <DialogFooter>
            <Button type='submit' form='contact-form' disabled={isPending}>
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {duplicate && (
        <ContactDuplicateDialog
          open
          onOpenChange={(state) => {
            if (!state) setDuplicate(null)
          }}
          fullName={duplicate.fullName}
          hidden={duplicate.hidden}
          onReactivate={handleReactivate}
          onCreateAnyway={handleCreateAnyway}
        />
      )}
    </>
  )
}
