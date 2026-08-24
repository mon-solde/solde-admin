import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Trans, useLingui } from '@lingui/react/macro'
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
import { Textarea } from '@/components/ui/textarea'
import { useAddVehicleEvent, useUpdateVehicleEvent } from '../../api/vehicles-api'
import { type VehicleEvent } from '../../data/schema'

type EventForm = { note: string }

type EventMutateDialogProps = {
  vehicleId: string
  currentEvent?: VehicleEvent
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventMutateDialog({
  vehicleId,
  currentEvent,
  open,
  onOpenChange,
}: EventMutateDialogProps) {
  const isEdit = !!currentEvent
  const addEvent = useAddVehicleEvent(vehicleId)
  const updateEvent = useUpdateVehicleEvent(vehicleId)
  const isPending = addEvent.isPending || updateEvent.isPending
  const { t } = useLingui()

  const formSchema = useMemo(
    () =>
      z.object({
        note: z.string().min(1, t`La note est requise`),
      }),
    [t]
  )

  const form = useForm<EventForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { note: currentEvent?.note ?? '' },
  })

  const onSubmit = (values: EventForm) => {
    const onSuccess = () => {
      toast.success(isEdit ? t`Événement modifié.` : t`Événement ajouté.`)
      form.reset()
      onOpenChange(false)
    }
    const onError = (error: any) =>
      toast.error(error?.response?.data?.message ?? t`Une erreur est survenue.`)

    if (currentEvent) {
      updateEvent.mutate(
        { eventId: currentEvent.id, ...values },
        { onSuccess, onError }
      )
      return
    }

    addEvent.mutate(values, { onSuccess, onError })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? (
              <Trans>Modifier l’événement</Trans>
            ) : (
              <Trans>Ajouter un événement</Trans>
            )}
          </DialogTitle>
          <DialogDescription>
            <Trans>Une note libre sur ce véhicule, sans montant associé.</Trans>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='event-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Note</Trans>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t`Ex : Le vendeur a dit démarreur, finalement tout le moteur.`}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='event-form' disabled={isPending}>
            {isPending ? t`Enregistrement…` : isEdit ? t`Modifier` : t`Ajouter`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
