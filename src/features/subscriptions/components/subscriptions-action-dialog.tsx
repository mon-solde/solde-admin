import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { DecimalInput } from '@/components/ui/decimal-input'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { useCreateRecurringCharge } from '../api/subscriptions-api'
import { subscriptionTypes } from '../data/data'

const subscriptionFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  amount: z
    .number({ error: 'Requis' })
    .min(0.01, 'Le montant doit être supérieur à 0'),
  type: z.enum(['AUTOMATIC', 'MANUAL'], { error: 'Choisir un type' }),
  dueDay: z
    .number({ error: 'Requis' })
    .min(1, 'Min 1')
    .max(31, 'Max 31')
    .optional(),
})

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>

type SubscriptionsActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionsActionDialog({
  open,
  onOpenChange,
}: SubscriptionsActionDialogProps) {
  const { mutate: createCharge, isPending } = useCreateRecurringCharge()

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: '',
      amount: 0,
      type: 'AUTOMATIC',
      dueDay: 1,
    },
  })

  const selectedType = form.watch('type')
  const isManual = selectedType === 'MANUAL'

  function handleSubmit(values: SubscriptionFormValues) {
    createCharge(
      {
        name: values.name,
        amount: values.amount,
        type: values.type,
        dueDay: isManual ? undefined : values.dueDay,
      },
      {
        onSuccess: () => {
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
          <DialogTitle>Nouvelle charge récurrente</DialogTitle>
          <DialogDescription>
            Renseignez les informations de la nouvelle charge récurrente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='subscription-form'
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Nom</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Assurance auto - Golf 6'
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
              name='amount'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Montant</FormLabel>
                  <FormControl>
                    <div className='relative col-span-4'>
                      <DecimalInput placeholder='0,00' {...field} />
                      <span className='pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                        €
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Type</FormLabel>
                  <div className='col-span-4'>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      isControlled
                      placeholder='Choisir un type'
                      items={subscriptionTypes.map((t) => ({
                        label: t.label,
                        value: t.value,
                      }))}
                    />
                  </div>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />

            {!isManual && (
              <FormField
                control={form.control}
                name='dueDay'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Jour de prélèvement
                    </FormLabel>
                    <FormControl>
                      <div className='relative col-span-4'>
                        <Input
                          type='number'
                          min='1'
                          max='31'
                          placeholder='1'
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                        <span className='pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                          / mois
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='subscription-form' disabled={isPending}>
            Créer la charge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
