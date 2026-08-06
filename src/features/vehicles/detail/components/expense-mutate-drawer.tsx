import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { formatPersonName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DecimalInput } from '@/components/ui/decimal-input'
import {
  Dialog,
  DialogClose,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SelectDropdown } from '@/components/select-dropdown'
import { useAddExpense } from '../../api/vehicles-api'
import { type VehicleDetail } from '../../data/schema'

const payerSchema = z.object({
  payerId: z.string().min(1, 'Sélectionner un participant'),
  amount: z
    .number({ error: 'Requis' })
    .min(0.01, 'Le montant doit être supérieur à 0'),
  source: z.enum(['BANK', 'CASH']),
  imputedToId: z.string().optional(),
})

const formSchema = z.object({
  label: z.string().min(1, 'Le libellé est requis'),
  date: z.string().min(1, 'La date est requise'),
  payers: z.array(payerSchema).min(1, 'Au moins un payeur requis'),
})

type ExpenseForm = z.infer<typeof formSchema>

type ExpenseMutateDrawerProps = {
  vehicle: VehicleDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpenseMutateDrawer({
  vehicle,
  open,
  onOpenChange,
}: ExpenseMutateDrawerProps) {
  const { mutate: addExpense, isPending } = useAddExpense(vehicle.id)
  const { auth } = useAuthStore()
  const ownerId = auth.user?.accountNo ?? ''
  const payerOptions = [
    { contactId: ownerId, firstName: 'Vous', lastName: null as string | null },
    ...vehicle.participants,
  ]

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      date: new Date().toISOString().split('T')[0],
      payers: [
        {
          payerId: '',
          amount: 0,
          source: 'BANK' as const,
          imputedToId: undefined,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'payers',
  })

  const payers = form.watch('payers')
  const totalAmount = payers.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  )

  const onSubmit = (data: ExpenseForm) => {
    addExpense(
      {
        label: data.label,
        date: data.date,
        // Banque/Espèces only means something for your own payment — a
        // contact's money never touches your tracked balances.
        payers: data.payers.map((p) => ({
          ...p,
          source: p.payerId === ownerId ? p.source : undefined,
        })),
      },
      {
        onSuccess: () => {
          toast.success('Dépense ajoutée.')
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
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <DialogContent className='flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-md'>
        <DialogHeader className='px-6 py-5'>
          <DialogTitle>Ajouter une dépense</DialogTitle>
          <DialogDescription>{vehicle.name}</DialogDescription>
        </DialogHeader>

        <Separator />

        <Form {...form}>
          <form
            id='expense-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5'
          >
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Libellé</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex : Révision moteur'
                      autoComplete='off'
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

            <Separator />

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-medium'>Qui a payé ?</p>
                <span className='text-sm font-medium'>
                  Total :{' '}
                  <span className='text-foreground'>
                    {totalAmount.toLocaleString('fr-FR')} €
                  </span>
                </span>
              </div>

              {fields.map((field, index) => {
                const imputedToId = form.watch(`payers.${index}.imputedToId`)
                const isOwnerPayer =
                  form.watch(`payers.${index}.payerId`) === ownerId
                const otherParticipants = payerOptions.filter(
                  (p) => p.contactId !== form.watch(`payers.${index}.payerId`)
                )
                return (
                  <div key={field.id} className='space-y-1.5'>
                    <div className='flex items-start gap-2'>
                      <div className='flex-1'>
                        <FormField
                          control={form.control}
                          name={`payers.${index}.payerId`}
                          render={({ field: f }) => (
                            <FormItem className='space-y-1'>
                              <SelectDropdown
                                defaultValue={f.value}
                                onValueChange={(v) => {
                                  f.onChange(v)
                                  if (
                                    form.getValues(
                                      `payers.${index}.imputedToId`
                                    ) === v
                                  ) {
                                    form.setValue(
                                      `payers.${index}.imputedToId`,
                                      undefined
                                    )
                                  }
                                }}
                                placeholder='Participant'
                                items={payerOptions.map((p) => ({
                                  label: formatPersonName(
                                    p.firstName,
                                    p.lastName
                                  ),
                                  value: p.contactId,
                                }))}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className='w-24'>
                        <FormField
                          control={form.control}
                          name={`payers.${index}.amount`}
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
                                    €
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {isOwnerPayer && (
                        <div className='w-24'>
                          <FormField
                            control={form.control}
                            name={`payers.${index}.source`}
                            render={({ field: f }) => (
                              <FormItem className='space-y-1'>
                                <Select
                                  value={f.value}
                                  onValueChange={f.onChange}
                                >
                                  <SelectTrigger className='h-9'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='BANK'>Banque</SelectItem>
                                    <SelectItem value='CASH'>
                                      Espèces
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
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

                    {imputedToId ? (
                      <FormField
                        control={form.control}
                        name={`payers.${index}.imputedToId`}
                        render={({ field: f }) => (
                          <FormItem className='ms-1 space-y-1'>
                            <div className='flex items-center gap-2'>
                              <span className='text-xs text-muted-foreground'>
                                Pour le compte de
                              </span>
                              <div className='flex-1'>
                                <SelectDropdown
                                  defaultValue={f.value ?? ''}
                                  onValueChange={f.onChange}
                                  placeholder='Participant'
                                  items={otherParticipants.map((p) => ({
                                    label: formatPersonName(
                                      p.firstName,
                                      p.lastName
                                    ),
                                    value: p.contactId,
                                  }))}
                                />
                              </div>
                              <button
                                type='button'
                                onClick={() =>
                                  form.setValue(
                                    `payers.${index}.imputedToId`,
                                    undefined
                                  )
                                }
                                className='text-xs text-muted-foreground hover:text-foreground'
                              >
                                Annuler
                              </button>
                            </div>
                          </FormItem>
                        )}
                      />
                    ) : (
                      <button
                        type='button'
                        className='ms-1 text-xs text-muted-foreground hover:text-foreground'
                        onClick={() =>
                          form.setValue(
                            `payers.${index}.imputedToId`,
                            otherParticipants[0]?.contactId ?? ''
                          )
                        }
                      >
                        Payé pour quelqu'un d'autre ?
                      </button>
                    )}
                  </div>
                )
              })}

              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-full'
                onClick={() =>
                  append({
                    payerId: '',
                    amount: 0,
                    source: 'BANK' as const,
                    imputedToId: undefined,
                  })
                }
              >
                <PlusIcon size={14} className='me-1' />
                Ajouter un payeur
              </Button>
            </div>
          </form>
        </Form>

        <Separator />

        <DialogFooter className='px-6 py-4'>
          <DialogClose asChild>
            <Button variant='outline'>Annuler</Button>
          </DialogClose>
          <Button form='expense-form' type='submit' disabled={isPending}>
            {isPending ? 'Enregistrement…' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
