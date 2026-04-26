import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, Trash2 } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { UserCombobox } from '@/features/users/components/user-combobox'
import { useCreateVehicle } from '../api/vehicles-api'

const participantSchema = z.object({
  userId: z.string().min(1, 'Sélectionner un participant'),
  profitShare: z
    .number({ error: 'Requis' })
    .min(1, 'Min 1%')
    .max(100, 'Max 100%'),
})

const formSchema = z
  .object({
    name: z.string().min(1, 'Le nom est requis'),
    purchaseDate: z.string().min(1, "La date d'achat est requise"),
    purchasePrice: z.number({ error: 'Requis' }).min(0, 'Doit être positif'),
    participants: z
      .array(participantSchema)
      .min(1, 'Au moins un participant requis'),
  })
  .refine(
    // Same logic as the backend: allow up to 0.001 for machine rounding errors,
    // but reject any human-visible gap like 55% + 44.99% = 99.99%.
    (data) =>
      Math.abs(
        data.participants.reduce((sum, p) => sum + p.profitShare, 0) - 100
      ) <= 0.001,
    {
      message: 'La somme des parts de bénéfices doit être égale à 100%',
      path: ['participants'],
    }
  )

type VehicleForm = z.infer<typeof formSchema>

type VehiclesActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VehiclesActionDialog({
  open,
  onOpenChange,
}: VehiclesActionDialogProps) {
  const { mutate, isPending } = useCreateVehicle()

  const form = useForm<VehicleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      purchaseDate: '',
      purchasePrice: 0,
      participants: [{ userId: '', profitShare: 0 }],
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

  const onSubmit = (values: VehicleForm) => {
    mutate(
      {
        name: values.name,
        purchaseDate: values.purchaseDate,
        purchasePrice: values.purchasePrice,
        participants: values.participants.map((p) => ({
          userId: p.userId,
          profitShare: p.profitShare,
        })),
      },
      {
        onSuccess: () => {
          toast.success('Véhicule créé.')
          form.reset()
          onOpenChange(false)
        },
        onError: (error: any) =>
          toast.error(
            error?.response?.data?.message ?? 'Une erreur est survenue.'
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Nouveau véhicule</DialogTitle>
          <DialogDescription>
            Renseignez les informations du véhicule et ses participants.
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
                    <FormLabel className='col-span-2 text-end'>Nom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Audi A5 2018'
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
                      Date d&apos;achat
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
                      Prix d&apos;achat
                    </FormLabel>
                    <FormControl>
                      <div className='relative col-span-4'>
                        <Input
                          type='number'
                          placeholder='0'
                          step='0.01'
                          className='pe-6'
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
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
                  <p className='text-sm font-medium'>Participants</p>
                  <span
                    className={`text-xs font-medium ${totalShare === 100 ? 'text-green-600' : 'text-muted-foreground'}`}
                  >
                    Total : {totalShare}%
                  </span>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className='flex items-start gap-2'>
                    <div className='flex-1'>
                      <FormField
                        control={form.control}
                        name={`participants.${index}.userId`}
                        render={({ field: f }) => (
                          <FormItem className='space-y-1'>
                            <UserCombobox
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
                                <Input
                                  type='number'
                                  placeholder='0'
                                  className='pe-6'
                                  {...f}
                                  onChange={(e) =>
                                    f.onChange(e.target.valueAsNumber)
                                  }
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
                      disabled={fields.length === 1}
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
                  onClick={() => append({ userId: '', profitShare: 0 })}
                >
                  <PlusIcon size={14} className='me-1' />
                  Ajouter un participant
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type='submit' form='vehicle-form' disabled={isPending}>
            {isPending ? 'Enregistrement…' : 'Créer le véhicule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
