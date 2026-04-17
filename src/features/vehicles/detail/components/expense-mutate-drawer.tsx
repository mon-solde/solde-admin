import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, Trash2 } from 'lucide-react'
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Vehicle, type Expense } from '../../data/schema'

const payerSchema = z.object({
  userId: z.string().min(1, 'Sélectionner un participant'),
  userName: z.string(),
  amount: z.coerce
    .number({ error: 'Requis' })
    .min(0.01, 'Le montant doit être supérieur à 0'),
})

const formSchema = z.object({
  label: z.string().min(1, 'Le libellé est requis'),
  date: z.string().min(1, 'La date est requise'),
  payers: z.array(payerSchema).min(1, 'Au moins un payeur requis'),
})

type ExpenseForm = z.infer<typeof formSchema>

type ExpenseMutateDrawerProps = {
  vehicle: Vehicle
  currentExpense?: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpenseMutateDrawer({
  vehicle,
  currentExpense,
  open,
  onOpenChange,
}: ExpenseMutateDrawerProps) {
  const isUpdate = !!currentExpense

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isUpdate
      ? {
          label: currentExpense.label,
          date: currentExpense.date.toISOString().split('T')[0],
          payers: currentExpense.payers.map((p) => ({
            userId: p.userId,
            userName: p.userName,
            amount: p.amount,
          })),
        }
      : {
          label: '',
          date: new Date().toISOString().split('T')[0],
          payers: [{ userId: '', userName: '', amount: 0 }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'payers',
  })

  const payers = form.watch('payers')
  const totalAmount = payers.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const onSubmit = (data: ExpenseForm) => {
    onOpenChange(false)
    form.reset()
    // appel API ici plus tard
    console.log(data)
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
          <SheetTitle>
            {isUpdate ? 'Modifier la dépense' : 'Ajouter une dépense'}
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Modifiez les informations de la dépense.'
              : `Ajoutez une dépense pour ${vehicle.make} ${vehicle.model}.`}
          </SheetDescription>
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
                    <Input placeholder='Ex : Révision moteur' autoComplete='off' {...field} />
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

            {/* Payeurs */}
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
                            onValueChange={(val) => {
                              f.onChange(val)
                              const participant = vehicle.participants.find(
                                (p) => p.userId === val
                              )
                              if (participant) {
                                form.setValue(
                                  `payers.${index}.userName`,
                                  participant.userName
                                )
                              }
                            }}
                            placeholder='Participant'
                            items={vehicle.participants.map((p) => ({
                              label: p.userName,
                              value: p.userId,
                            }))}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='w-28'>
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
                onClick={() => append({ userId: '', userName: '', amount: 0 })}
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
          <Button form='expense-form' type='submit'>
            {isUpdate ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
