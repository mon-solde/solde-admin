import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Trans, useLingui } from '@lingui/react/macro'
import { Loader2 } from 'lucide-react'
import { eurosToCents } from '@/lib/money'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { DecimalInput } from '@/components/ui/decimal-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useInitMonth } from '../api/budget-api'
import { MONTH_MESSAGES } from '../data/data'

type BudgetInitMonthDialogProps = {
  year: number
  month: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetInitMonthDialog({
  year,
  month,
  open,
  onOpenChange,
}: BudgetInitMonthDialogProps) {
  const navigate = useNavigate()
  const { mutate: initMonth, isPending } = useInitMonth()
  const { i18n, t } = useLingui()
  const formSchema = useMemo(
    () =>
      z.object({
        receivedSalary: z
          .number({ error: () => t`Le salaire est requis.` })
          .positive(t`Le salaire doit être positif.`),
      }),
    [t]
  )
  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { receivedSalary: 0 },
  })

  function handleSubmit(values: FormValues) {
    initMonth(
      { year, month, receivedSalary: eurosToCents(values.receivedSalary) },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
          navigate({ to: '/budget/detail', search: { year, month } })
        },
      }
    )
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(state) => {
        if (!state) onOpenChange(false)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans>
              Initialiser {i18n._(MONTH_MESSAGES[month - 1])} {year}
            </Trans>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Trans>Saisissez le salaire reçu pour créer le budget du mois.</Trans>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form id='init-month-form' onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name='receivedSalary'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    <Trans>Salaire reçu</Trans>
                  </FormLabel>
                  <FormControl>
                    <div className='relative col-span-4'>
                      <DecimalInput placeholder='1384,17' {...field} />
                      <span className='pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                        €
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            <Trans>Annuler</Trans>
          </AlertDialogCancel>
          <Button type='submit' form='init-month-form' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            <Trans>Initialiser</Trans>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
