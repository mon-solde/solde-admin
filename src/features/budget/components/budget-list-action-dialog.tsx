import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInitMonth } from '../api/budget-api'
import { FRENCH_MONTHS } from '../data/data'
import { getNextAvailableMonth } from '../data/monthly-budgets'
import { useBudgetList } from './budget-list-provider'

const formSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  receivedSalary: z
    .number({ error: () => 'Le salaire est requis.' })
    .positive('Le salaire doit être positif.'),
})

type BudgetListActionDialogForm = z.infer<typeof formSchema>

type BudgetListActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetListActionDialog({
  open,
  onOpenChange,
}: BudgetListActionDialogProps) {
  const { budgets } = useBudgetList()
  const navigate = useNavigate()
  const defaults = getNextAvailableMonth(budgets)
  const { mutate: initMonth, isPending } = useInitMonth()

  const form = useForm<BudgetListActionDialogForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: defaults.month,
      year: defaults.year,
      receivedSalary: undefined,
    },
  })

  const selectedMonth = form.watch('month')
  const selectedYear = form.watch('year')

  const onSubmit = (values: BudgetListActionDialogForm) => {
    initMonth(
      {
        year: values.year,
        month: values.month,
        receivedSalary: values.receivedSalary,
      },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
          navigate({
            to: '/budget/detail',
            search: { year: values.year, month: values.month },
          })
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
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Nouveau mois</DialogTitle>
          <DialogDescription>
            Créer le budget pour {FRENCH_MONTHS[selectedMonth - 1]}{' '}
            {selectedYear}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='budget-add-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <div className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
              <FormLabel className='col-span-2 text-end'>Mois</FormLabel>
              <div className='col-span-4 flex overflow-hidden rounded-md border'>
                <FormField
                  control={form.control}
                  name='month'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <FormControl>
                          <SelectTrigger className='rounded-none border-0 border-r shadow-none focus:ring-0'>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FRENCH_MONTHS.map((label, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='year'
                  render={({ field }) => (
                    <FormItem className='w-24'>
                      <FormControl>
                        <Input
                          type='number'
                          min={2020}
                          max={2100}
                          className='rounded-none border-0 shadow-none focus-visible:ring-0'
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name='receivedSalary'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Salaire reçu
                  </FormLabel>
                  <div className='col-span-4 space-y-1'>
                    <FormControl>
                      <div className='relative'>
                        <DecimalInput placeholder='1 384,17' {...field} />
                        <span className='pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                          €
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='budget-add-form' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
