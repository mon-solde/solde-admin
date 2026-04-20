import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  calculateTotalPaid,
  formatEuros,
  formatFrenchDate,
  getTodayAsInputValue,
  resolveActionState,
} from '../data/data'
import { FRENCH_MONTHS } from '../data/data'
import { type ActionPayment, type MonthlyManualAction } from '../data/schema'

const addPaymentFormSchema = z.object({
  amount: z.number({ error: 'Requis' }).min(0.01, 'Montant requis'),
  paymentDate: z.string().min(1, 'Date requise'),
})

type AddPaymentFormValues = z.infer<typeof addPaymentFormSchema>

const stateStyles: Record<string, string> = {
  pending: 'text-gray-500 bg-gray-50 border-gray-200',
  partial: 'text-amber-600 bg-amber-50 border-amber-200',
  done: 'text-green-600 bg-green-50 border-green-200',
}

const stateLabels: Record<string, string> = {
  pending: 'À faire',
  partial: 'Partiel',
  done: 'Fait ✓',
}

type BudgetActionPaymentSheetProps = {
  entry: MonthlyManualAction
  payments: ActionPayment[]
  month: number
  year: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddPayment: (payment: { amount: number; paymentDate: Date }) => void
}

export function BudgetActionPaymentSheet({
  entry,
  payments,
  month,
  year,
  open,
  onOpenChange,
  onAddPayment,
}: BudgetActionPaymentSheetProps) {
  const form = useForm<AddPaymentFormValues>({
    resolver: zodResolver(addPaymentFormSchema),
    defaultValues: { amount: 0, paymentDate: getTodayAsInputValue() },
  })

  const totalPaid = calculateTotalPaid(payments)
  const progressPercent = Math.min((totalPaid / entry.plannedAmount) * 100, 100)
  const state = resolveActionState(totalPaid, entry.plannedAmount)
  const remainingAmount = entry.plannedAmount - totalPaid

  function handleSubmit(values: AddPaymentFormValues) {
    onAddPayment({
      amount: values.amount,
      paymentDate: new Date(values.paymentDate),
    })
    form.reset({ amount: 0, paymentDate: getTodayAsInputValue() })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col gap-0 sm:max-w-md'>
        <SheetHeader className='pb-4'>
          <SheetTitle>{entry.label}</SheetTitle>
          <SheetDescription>
            {FRENCH_MONTHS[month - 1]} {year} · Prévu :{' '}
            {formatEuros(entry.plannedAmount)}
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-2 pb-4'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>
              {formatEuros(totalPaid)} payés
            </span>
            <Badge
              variant='outline'
              className={cn('text-xs', stateStyles[state])}
            >
              {stateLabels[state]}
            </Badge>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                state === 'done' ? 'bg-green-500' : 'bg-amber-400'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {state === 'partial' && (
            <p className='text-right text-xs text-amber-600'>
              Reste {formatEuros(remainingAmount)}
            </p>
          )}
        </div>

        <Separator />

        <div className='flex-1 overflow-y-auto py-4'>
          {payments.length === 0 ? (
            <p className='text-center text-sm text-muted-foreground'>
              Aucun paiement enregistré
            </p>
          ) : (
            <div className='space-y-3'>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className='flex items-center justify-between rounded-md border px-3 py-2'
                >
                  <div>
                    <p className='text-sm font-medium'>
                      Payé le {formatFrenchDate(payment.paymentDate)}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Inscrit le {formatFrenchDate(payment.createdAt)}
                    </p>
                  </div>
                  <span className='font-semibold text-green-600'>
                    {formatEuros(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className='pt-4'>
          <p className='mb-3 text-sm font-medium'>Ajouter un paiement</p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-3'
            >
              <div className='flex gap-2'>
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem className='flex-1 space-y-1'>
                      <FormLabel className='text-xs'>Montant</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type='number'
                            step='0.01'
                            min='0'
                            placeholder='0'
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='paymentDate'
                  render={({ field }) => (
                    <FormItem className='flex-1 space-y-1'>
                      <FormLabel className='text-xs'>
                        Date du paiement
                      </FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='submit' className='w-full'>
                Ajouter
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
