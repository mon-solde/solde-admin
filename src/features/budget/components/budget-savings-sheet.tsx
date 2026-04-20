import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
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
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  formatEuros,
  formatFrenchDate,
  getTodayAsInputValue,
  FRENCH_MONTHS,
} from '../data/data'
import { type SavingsWithdrawal } from '../data/schema'

const addWithdrawalFormSchema = z.object({
  amount: z.number({ error: 'Requis' }).min(0.01, 'Montant requis'),
  destination: z.union([z.literal('bank'), z.literal('cash')]),
  withdrawalDate: z.string().min(1, 'Date requise'),
})

type AddWithdrawalFormValues = z.infer<typeof addWithdrawalFormSchema>

type BudgetSavingsSheetProps = {
  withdrawals: SavingsWithdrawal[]
  totalSaved: number
  availableForSavings: number
  month: number
  year: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddWithdrawal: (withdrawal: {
    amount: number
    destination: 'bank' | 'cash'
    withdrawalDate: Date
  }) => void
}

export function BudgetSavingsSheet({
  withdrawals,
  totalSaved,
  availableForSavings,
  month,
  year,
  open,
  onOpenChange,
  onAddWithdrawal,
}: BudgetSavingsSheetProps) {
  const form = useForm<AddWithdrawalFormValues>({
    resolver: zodResolver(addWithdrawalFormSchema),
    defaultValues: {
      amount: 0,
      destination: 'bank',
      withdrawalDate: getTodayAsInputValue(),
    },
  })

  const progressPercent =
    availableForSavings > 0
      ? Math.min((totalSaved / availableForSavings) * 100, 100)
      : 0

  function handleSubmit(values: AddWithdrawalFormValues) {
    onAddWithdrawal({
      amount: values.amount,
      destination: values.destination,
      withdrawalDate: new Date(values.withdrawalDate),
    })
    form.reset({
      amount: 0,
      destination: 'bank',
      withdrawalDate: getTodayAsInputValue(),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col gap-0 sm:max-w-md'>
        <SheetHeader className='pb-4'>
          <SheetTitle>Épargne mise de côté</SheetTitle>
          <SheetDescription>
            {FRENCH_MONTHS[month - 1]} {year} · Disponible :{' '}
            {formatEuros(availableForSavings)}
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-2 pb-4'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>
              {formatEuros(totalSaved)} retirés
            </span>
            <span
              className={cn(
                'font-medium',
                progressPercent >= 100 ? 'text-green-600' : 'text-amber-600'
              )}
            >
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                progressPercent >= 100 ? 'bg-green-500' : 'bg-amber-400'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <Separator />

        <div className='flex-1 overflow-y-auto py-4'>
          {withdrawals.length === 0 ? (
            <p className='text-center text-sm text-muted-foreground'>
              Aucun retrait enregistré
            </p>
          ) : (
            <div className='space-y-3'>
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className='flex items-center justify-between rounded-md border px-3 py-2'
                >
                  <div>
                    <p className='text-sm font-medium'>
                      Retiré le {formatFrenchDate(withdrawal.withdrawalDate)}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {withdrawal.destination === 'bank' ? 'Banque' : 'Espèces'}{' '}
                      · Inscrit le {formatFrenchDate(withdrawal.createdAt)}
                    </p>
                  </div>
                  <span className='font-semibold text-green-600'>
                    {formatEuros(withdrawal.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className='pt-4'>
          <p className='mb-3 text-sm font-medium'>Enregistrer un retrait</p>
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
                  name='destination'
                  render={({ field }) => (
                    <FormItem className='flex-1 space-y-1'>
                      <FormLabel className='text-xs'>Destination</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='bank'>Banque</SelectItem>
                          <SelectItem value='cash'>Espèces</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='withdrawalDate'
                  render={({ field }) => (
                    <FormItem className='flex-1 space-y-1'>
                      <FormLabel className='text-xs'>Date du retrait</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='submit' className='w-full'>
                Enregistrer
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
