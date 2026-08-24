import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Trans, useLingui } from '@lingui/react/macro'
import { formatPersonName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DecimalInput } from '@/components/ui/decimal-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useUpdateVehicleParticipants } from '../../api/vehicles-api'
import { type VehicleDetail } from '../../data/schema'

type EditParticipantsForm = {
  participants: { contactId: string; profitShare: number }[]
}

type EditParticipantsDialogProps = {
  vehicle: VehicleDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditParticipantsDialog({
  vehicle,
  open,
  onOpenChange,
}: EditParticipantsDialogProps) {
  const { mutate: updateParticipants, isPending } =
    useUpdateVehicleParticipants(vehicle.id)
  const { t } = useLingui()

  const participantSchema = useMemo(
    () =>
      z.object({
        contactId: z.string(),
        profitShare: z.number({ error: t`Requis` }).min(0).max(100),
      }),
    [t]
  )

  const formSchema = useMemo(
    () =>
      z
        .object({
          participants: z.array(participantSchema),
        })
        .refine(
          // Same rule as vehicle creation: contacts' shares can add up to less
          // than 100 (the owner keeps the rest), but not more. 0.001 of slack
          // absorbs machine rounding errors only.
          (data) =>
            data.participants.reduce((sum, p) => sum + p.profitShare, 0) -
              100 <=
            0.001,
          {
            message: t`La somme des parts des participants ne peut pas dépasser 100%`,
            path: ['participants'],
          }
        ),
    [t, participantSchema]
  )

  const form = useForm<EditParticipantsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participants: vehicle.participants.map((p) => ({
        contactId: p.contactId,
        profitShare: p.profitShare,
      })),
    },
  })

  // This dialog stays mounted between opens — without this, reopening it
  // after a successful save (or after vehicle.participants otherwise
  // changes) would still show the values captured at first mount.
  useEffect(() => {
    if (!open) return
    form.reset({
      participants: vehicle.participants.map((p) => ({
        contactId: p.contactId,
        profitShare: p.profitShare,
      })),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle.participants])

  const watchedParticipants = form.watch('participants')
  const totalShare = watchedParticipants.reduce(
    (sum, p) => sum + (Number(p.profitShare) || 0),
    0
  )
  const ownerShare = Math.max(0, 100 - totalShare)

  const onSubmit = (values: EditParticipantsForm) => {
    updateParticipants(
      { participants: values.participants },
      {
        onSuccess: () => {
          toast.success(t`Parts mises à jour.`)
          onOpenChange(false)
        },
        onError: (error: any) =>
          toast.error(
            error?.response?.data?.message ?? t`Une erreur est survenue.`
          ),
      }
    )
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
            <Trans>Modifier les parts</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Ajustez le pourcentage de bénéfice de chaque participant.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='participants-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-3'
          >
            <div className='flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2'>
              <span className='text-sm font-medium'>{t`Vous`}</span>
              <span className='text-sm font-medium tabular-nums'>
                {ownerShare}%
              </span>
            </div>

            {vehicle.participants.map((p, index) => (
              <FormField
                key={p.contactId}
                control={form.control}
                name={`participants.${index}.profitShare`}
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between gap-3 space-y-0'>
                    <FormLabel className='font-normal'>
                      {formatPersonName(p.firstName, p.lastName)}
                    </FormLabel>
                    <div className='flex items-center gap-1'>
                      <FormControl>
                        <DecimalInput className='w-20 text-end' {...field} />
                      </FormControl>
                      <span className='text-sm text-muted-foreground'>%</span>
                    </div>
                  </FormItem>
                )}
              />
            ))}

            {form.formState.errors.participants?.root && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.participants.root.message}
              </p>
            )}
            <FormMessage />
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='participants-form' disabled={isPending}>
            {isPending ? t`Enregistrement…` : t`Enregistrer`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
