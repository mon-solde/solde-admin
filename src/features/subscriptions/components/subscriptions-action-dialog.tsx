import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trans, useLingui } from '@lingui/react/macro'
import { centsToEuros, eurosToCents } from '@/lib/money'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Label } from '@/components/ui/label'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  useAddRecurringChargeToBudget,
  useGetMonthlyBudget,
} from '@/features/budget/api/budget-api'
import {
  useCreateRecurringCharge,
  useUpdateRecurringCharge,
} from '../api/subscriptions-api'
import { subscriptionTypes } from '../data/data'
import { type Subscription } from '../data/schema'

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
  const { i18n, t } = useLingui()
  const isEdit = !!currentRow
  const createCharge = useCreateRecurringCharge()
  const updateCharge = useUpdateRecurringCharge()
  const addToBudget = useAddRecurringChargeToBudget()
  const isPending = createCharge.isPending || updateCharge.isPending

  // Rebuilt whenever the active language changes — otherwise these
  // messages would stay frozen in whichever language was active when the
  // component first rendered.
  const subscriptionFormSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t`Le nom est requis`),
        amount: z
          .number({ error: t`Requis` })
          .min(0.01, t`Le montant doit être supérieur à 0`),
        type: z.enum(['AUTOMATIC', 'MANUAL'], { error: t`Choisir un type` }),
        dueDay: z
          .number({ error: t`Requis` })
          .min(1, t`Min 1`)
          .max(31, t`Max 31`)
          .optional(),
      }),
    [t]
  )
  type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>

  // A charge created after the current month's budget was already
  // generated doesn't retroactively appear in it (see MonthlyRecurringCharge
  // — frozen at generation time) — offering to attach it immediately closes
  // that gap for the common case, without touching any past month.
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const { data: currentBudget } = useGetMonthlyBudget(currentYear, currentMonth)
  const [applyToCurrentMonth, setApplyToCurrentMonth] = useState(true)
  const showApplyToCurrentMonth = !isEdit && !!currentBudget

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: currentRow
      ? {
          name: currentRow.name,
          amount: centsToEuros(currentRow.amount),
          type: currentRow.type,
          dueDay: currentRow.dueDay ?? 1,
        }
      : {
          name: '',
          amount: 0,
          type: 'AUTOMATIC',
          dueDay: 1,
        },
  })

  const selectedType = form.watch('type')
  const isManual = selectedType === 'MANUAL'

  function handleSubmit(values: SubscriptionFormValues) {
    const payload = {
      name: values.name,
      amount: eurosToCents(values.amount),
      type: values.type,
      dueDay: isManual ? undefined : values.dueDay,
    }
    const close = () => {
      form.reset()
      onOpenChange(false)
    }

    if (currentRow) {
      updateCharge.mutate(
        { id: currentRow.id, ...payload },
        { onSuccess: close }
      )
      return
    }

    createCharge.mutate(payload, {
      onSuccess: ({ id }) => {
        if (showApplyToCurrentMonth && applyToCurrentMonth && currentBudget) {
          addToBudget.mutate(
            { budgetId: currentBudget.id, recurringChargeId: id },
            { onSuccess: close, onError: close }
          )
          return
        }
        close()
      },
    })
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
            {isEdit ? (
              <Trans>Modifier la charge récurrente</Trans>
            ) : (
              <Trans>Nouvelle charge récurrente</Trans>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? (
              <Trans>
                Les mois déjà générés ne sont pas affectés par cette
                modification — seuls les futurs mois en tiendront compte.
              </Trans>
            ) : (
              <Trans>
                Renseignez les informations de la nouvelle charge récurrente.
              </Trans>
            )}
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
                  <FormLabel className='col-span-2 text-end'>
                    <Trans>Nom</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t`Assurance auto - Golf 6`}
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
                  <FormLabel className='col-span-2 text-end'>
                    <Trans>Montant</Trans>
                  </FormLabel>
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
                  <FormLabel className='col-span-2 text-end'>
                    <Trans>Type</Trans>
                  </FormLabel>
                  <div className='col-span-4'>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      isControlled
                      placeholder={t`Choisir un type`}
                      items={subscriptionTypes.map((item) => ({
                        label: i18n._(item.label),
                        value: item.value,
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
                      <Trans>Jour de prélèvement</Trans>
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
                          <Trans>/ mois</Trans>
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            )}

            {showApplyToCurrentMonth && (
              <div className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
                <div className='col-span-4 col-start-3 flex items-center gap-2'>
                  <Checkbox
                    id='apply-to-current-month'
                    checked={applyToCurrentMonth}
                    onCheckedChange={(value) =>
                      setApplyToCurrentMonth(value === true)
                    }
                  />
                  <Label
                    htmlFor='apply-to-current-month'
                    className='font-normal'
                  >
                    <Trans>Appliquer aussi au mois en cours</Trans>
                  </Label>
                </div>
              </div>
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='subscription-form' disabled={isPending}>
            {isPending ? (
              <Trans>Enregistrement…</Trans>
            ) : isEdit ? (
              <Trans>Enregistrer</Trans>
            ) : (
              <Trans>Créer la charge</Trans>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
