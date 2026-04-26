import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { useAddExpense } from '../../api/vehicles-api'
import { type VehicleDetail } from '../../data/schema'

const payerSchema = z.object({
  userId: z.string().min(1, 'Sélectionner un participant'),
  amount: z
    .number({ error: 'Requis' })
    .min(0.01, 'Le montant doit être supérieur à 0'),
  source: z.enum(['BANK', 'CASH']),
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

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      date: new Date().toISOString().split('T')[0],
      payers: [{ userId: '', amount: 0, source: 'BANK' as const }],
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
        payers: data.payers,
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
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>Ajouter une dépense</SheetTitle>
          <SheetDescription>{vehicle.name}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='expense-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
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

              {fields.map((field, index) => (
                <div key={field.id} className='flex items-start gap-2'>
                  <div className='flex-1'>
                    <FormField
                      control={form.control}
                      name={`payers.${index}.userId`}
                      render={({ field: f }) => (
                        <FormItem className='space-y-1'>
                          <SelectDropdown
                            defaultValue={f.value}
                            onValueChange={f.onChange}
                            placeholder='Participant'
                            items={vehicle.participants.map((p) => ({
                              label: `${p.firstName} ${p.lastName}`,
                              value: p.userId,
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
                              <Input
                                type='number'
                                placeholder='0'
                                step='0.01'
                                className='pe-6'
                                {...f}
                                onChange={(e) =>
                                  f.onChange(e.target.valueAsNumber)
                                }
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
                  <div className='w-24'>
                    <FormField
                      control={form.control}
                      name={`payers.${index}.source`}
                      render={({ field: f }) => (
                        <FormItem className='space-y-1'>
                          <Select value={f.value} onValueChange={f.onChange}>
                            <SelectTrigger className='h-9'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='BANK'>Banque</SelectItem>
                              <SelectItem value='CASH'>Espèces</SelectItem>
                            </SelectContent>
                          </Select>
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

              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-full'
                onClick={() =>
                  append({ userId: '', amount: 0, source: 'BANK' as const })
                }
              >
                <PlusIcon size={14} className='me-1' />
                Ajouter un payeur
              </Button>
            </div>
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Annuler</Button>
          </SheetClose>
          <Button form='expense-form' type='submit' disabled={isPending}>
            {isPending ? 'Enregistrement…' : 'Ajouter'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
