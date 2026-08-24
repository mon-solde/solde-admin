import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Trans, useLingui } from '@lingui/react/macro'
import { Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetMonthlyBudgets, useInitMonth } from '../api/budget-api'
import { MONTH_MESSAGES } from '../data/data'
import { getNextAvailableMonth } from '../data/monthly-budgets'

type BudgetListActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetListActionDialog({
  open,
  onOpenChange,
}: BudgetListActionDialogProps) {
  const navigate = useNavigate()
  const { i18n, t } = useLingui()
  // Rebuilt whenever the active language changes — otherwise these
  // messages would stay frozen in whichever language was active when the
  // component first rendered.
  const formSchema = useMemo(
    () =>
      z.object({
        month: z.number().min(1).max(12),
        year: z
          .number()
          .min(2020, t`L'année doit être comprise entre 2020 et 2100.`)
          .max(2100, t`L'année doit être comprise entre 2020 et 2100.`),
        receivedSalary: z
          .number({ error: () => t`Le salaire est requis.` })
          .positive(t`Le salaire doit être positif.`),
      }),
    [t]
  )
  type BudgetListActionDialogForm = z.infer<typeof formSchema>

  // Only needs the single most recent budget, not the table's current
  // page — independent of whatever pagination/sort the list is on.
  const { data: latestPage } = useGetMonthlyBudgets({
    pageSize: 1,
    sortBy: 'month',
    sortOrder: 'desc',
  })
  const defaults = getNextAvailableMonth(latestPage?.data ?? [])
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
        receivedSalary: eurosToCents(values.receivedSalary),
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
          <DialogTitle>
            <Trans>Nouveau mois</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Créer le budget pour {i18n._(MONTH_MESSAGES[selectedMonth - 1])}{' '}
              {selectedYear}.
            </Trans>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='budget-add-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <div className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
              <FormLabel className='col-span-2 text-end'>
                <Trans>Mois</Trans>
              </FormLabel>
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
                          {MONTH_MESSAGES.map((message, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                              {i18n._(message)}
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
                    <Trans>Salaire reçu</Trans>
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
            <Trans>Créer</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
