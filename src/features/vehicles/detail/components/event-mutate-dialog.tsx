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
import { Textarea } from '@/components/ui/textarea'
import { useAddVehicleEvent, useUpdateVehicleEvent } from '../../api/vehicles-api'
import { type VehicleEvent } from '../../data/schema'

const formSchema = z.object({
  note: z.string().min(1, 'La note est requise'),
  date: z.string().min(1, 'La date est requise'),
})
type EventForm = z.infer<typeof formSchema>

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

  const form = useForm<EventForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentEvent
      ? {
          note: currentEvent.note,
          date: currentEvent.date.toISOString().split('T')[0],
        }
      : {
          note: '',
          date: new Date().toISOString().split('T')[0],
        },
  })

  const onSubmit = (values: EventForm) => {
    const onSuccess = () => {
      toast.success(isEdit ? 'Événement modifié.' : 'Événement ajouté.')
      form.reset()
      onOpenChange(false)
    }
    const onError = (error: any) =>
      toast.error(error?.response?.data?.message ?? 'Une erreur est survenue.')

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
            {isEdit ? 'Modifier l’événement' : 'Ajouter un événement'}
          </DialogTitle>
          <DialogDescription>
            Une note libre sur ce véhicule, sans montant associé.
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
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Ex : Le vendeur a dit démarreur, finalement tout le moteur.'
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='event-form' disabled={isPending}>
            {isPending ? 'Enregistrement…' : isEdit ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
