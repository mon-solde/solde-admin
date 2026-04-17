import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { subscriptionCategories, subscriptionPaymentTypes, subscriptionStatuses } from '../data/data'
import { type Subscription } from '../data/schema'

const subscriptionFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  amount: z.coerce.number({ error: 'Requis' }).min(0.01, 'Le montant doit être supérieur à 0'),
  billingDay: z.coerce.number({ error: 'Requis' }).min(1, 'Min 1').max(31, 'Max 31'),
  category: z.enum(['auto', 'telecom', 'ai', 'banking', 'other'], { error: 'Choisir une catégorie' }),
  status: z.enum(['active', 'paused'], { error: 'Choisir un statut' }),
  paymentType: z.enum(['automatic', 'manual'], { error: 'Choisir un type' }),
})

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>

type SubscriptionsActionDialogProps = {
  currentRow?: Subscription
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: SubscriptionsActionDialogProps) {
  const isEdit = !!currentRow

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          amount: currentRow.amount,
          billingDay: currentRow.billingDay,
          category: currentRow.category,
          status: currentRow.status,
          paymentType: currentRow.paymentType,
        }
      : {
          name: '',
          amount: 0,
          billingDay: 1,
          category: 'other',
          status: 'active',
          paymentType: 'automatic',
        },
  })

  const selectedPaymentType = form.watch('paymentType')
  const isManual = selectedPaymentType === 'manual'

  function handleSubmit(_values: SubscriptionFormValues) {
    form.reset()
    onOpenChange(false)
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
            {isEdit ? 'Modifier la charge' : 'Nouvelle charge récurrente'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifiez les informations de cette charge récurrente.'
              : 'Renseignez les informations de la nouvelle charge récurrente.'}
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
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
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
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                  <FormLabel className='col-span-2 text-end'>Montant</FormLabel>
                  <FormControl>
                    <div className='relative col-span-4'>
                      <Input type='number' step='0.01' min='0' placeholder='0,00' {...field} />
                      <span className='pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                        €
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />

            {!isManual && (
              <FormField
                control={form.control}
                name='billingDay'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                    <FormLabel className='col-span-2 text-end'>Jour de prélèvement</FormLabel>
                    <FormControl>
                      <div className='relative col-span-4'>
                        <Input type='number' min='1' max='31' placeholder='1' {...field} />
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

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                  <FormLabel className='col-span-2 text-end'>Catégorie</FormLabel>
                  <div className='col-span-4'>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      isControlled
                      placeholder='Choisir une catégorie'
                      items={subscriptionCategories.map((c) => ({
                        label: c.label,
                        value: c.value,
                      }))}
                    />
                  </div>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='paymentType'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                  <FormLabel className='col-span-2 text-end'>Type</FormLabel>
                  <div className='col-span-4'>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      isControlled
                      placeholder='Choisir un type'
                      items={subscriptionPaymentTypes.map((t) => ({
                        label: t.label,
                        value: t.value,
                      }))}
                    />
                  </div>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                  <FormLabel className='col-span-2 text-end'>Statut</FormLabel>
                  <div className='col-span-4'>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      isControlled
                      placeholder='Choisir un statut'
                      items={subscriptionStatuses.map((s) => ({
                        label: s.label,
                        value: s.value,
                      }))}
                    />
                  </div>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='subscription-form'>
            {isEdit ? 'Enregistrer' : 'Créer la charge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
