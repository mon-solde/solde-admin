import { useMemo } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trans, useLingui } from '@lingui/react/macro'
import { PlusIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { eurosToCents } from '@/lib/money'
import { Button } from '@/components/ui/button'
import { DecimalInput } from '@/components/ui/decimal-input'
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
import { Separator } from '@/components/ui/separator'
import { ContactCombobox } from '@/features/contacts/components/contact-combobox'
import { useCreateVehicle } from '../api/vehicles-api'

type VehicleForm = {
  name: string
  purchaseDate: string
  purchasePrice: number
  participants: { contactId: string; profitShare: number }[]
}

type VehiclesActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VehiclesActionDialog({
  open,
  onOpenChange,
}: VehiclesActionDialogProps) {
  const { mutate, isPending } = useCreateVehicle()
  const { t } = useLingui()

  const participantSchema = useMemo(
    () =>
      z.object({
        contactId: z.string().min(1, t`Sélectionner un participant`),
        profitShare: z
          .number({ error: t`Requis` })
          .min(1, t`Min 1%`)
          .max(100, t`Max 100%`),
      }),
    [t]
  )

  const formSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(1, t`Le nom est requis`),
          purchaseDate: z.string().min(1, t`La date d'achat est requise`),
          purchasePrice: z
            .number({ error: t`Requis` })
            .min(0, t`Doit être positif`),
          // Can be empty — the owner keeps whatever share the participants don't claim.
          participants: z.array(participantSchema),
        })
        .refine(
          // Same logic as the backend: participants' shares can add up to less
          // than 100% (the owner keeps the rest), but not more than 100%. 0.001
          // of slack absorbs machine rounding errors only.
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

  const form = useForm<VehicleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      purchaseDate: '',
      purchasePrice: 0,
      participants: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'participants',
  })

  const participants = form.watch('participants')
  const totalShare = participants.reduce(
    (sum, p) => sum + (Number(p.profitShare) || 0),
    0
  )
  const ownerShare = Math.max(0, 100 - totalShare)

  const onSubmit = (values: VehicleForm) => {
    mutate(
      {
        name: values.name,
        purchaseDate: values.purchaseDate,
        purchasePrice: eurosToCents(values.purchasePrice),
        participants: values.participants.map((p) => ({
          contactId: p.contactId,
          profitShare: p.profitShare,
        })),
      },
      {
        onSuccess: () => {
          toast.success(t`Véhicule créé.`)
          form.reset()
          onOpenChange(false)
        },
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            <Trans>Nouveau véhicule</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Renseignez les informations du véhicule et ses participants.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-[70vh] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='vehicle-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      <Trans>Nom</Trans>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t`Audi A5 2018`}
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
                name='purchaseDate'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      <Trans>Date d&apos;achat</Trans>
                    </FormLabel>
                    <FormControl>
                      <Input type='date' className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='purchasePrice'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      <Trans>Prix d&apos;achat</Trans>
                    </FormLabel>
                    <FormControl>
                      <div className='relative col-span-4'>
                        <DecimalInput
                          placeholder='0'
                          className='pe-6'
                          {...field}
                        />
                        <span className='pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                          €
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <Separator className='my-2' />

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium'>
                    <Trans>Participants</Trans>
                  </p>
                  <span
                    className={`text-xs font-medium ${totalShare > 100 ? 'text-destructive' : 'text-muted-foreground'}`}
                  >
                    <Trans>Contacts : {totalShare}%</Trans>
                  </span>
                </div>

                <div className='flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2'>
                  <span className='text-sm font-medium'>{t`Vous`}</span>
                  <span className='text-sm font-medium tabular-nums'>
                    {ownerShare}%
                  </span>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className='flex items-start gap-2'>
                    <div className='flex-1'>
                      <FormField
                        control={form.control}
                        name={`participants.${index}.contactId`}
                        render={({ field: f }) => (
                          <FormItem className='space-y-1'>
                            <ContactCombobox
                              value={f.value}
                              onChange={f.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='w-24'>
                      <FormField
                        control={form.control}
                        name={`participants.${index}.profitShare`}
                        render={({ field: f }) => (
                          <FormItem className='space-y-1'>
                            <FormControl>
                              <div className='relative'>
                                <DecimalInput
                                  placeholder='0'
                                  className='pe-6'
                                  {...f}
                                />
                                <span className='pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                                  %
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='mt-0.5 shrink-0 text-muted-foreground hover:text-destructive'
                      onClick={() => remove(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}

                {form.formState.errors.participants?.root && (
                  <p className='text-sm text-destructive'>
                    {form.formState.errors.participants.root.message}
                  </p>
                )}

                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='w-full'
                  onClick={() => append({ contactId: '', profitShare: 0 })}
                >
                  <PlusIcon size={14} className='me-1' />
                  <Trans>Ajouter un participant</Trans>
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type='submit' form='vehicle-form' disabled={isPending}>
            {isPending ? t`Enregistrement…` : t`Créer le véhicule`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
