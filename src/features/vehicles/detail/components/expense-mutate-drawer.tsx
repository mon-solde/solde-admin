import { useMemo } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trans, useLingui } from '@lingui/react/macro'
import { PlusIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { centsToEuros, eurosToCents, formatEuros } from '@/lib/money'
import { formatPersonName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DecimalInput } from '@/components/ui/decimal-input'
import {
  Dialog,
  DialogClose,
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
import { Separator } from '@/components/ui/separator'
import { SelectDropdown } from '@/components/select-dropdown'
import { useAddExpense, useUpdateExpense } from '../../api/vehicles-api'
import { type Expense, type VehicleDetail } from '../../data/schema'

type ExpenseForm = {
  label: string
  date: string
  payers: {
    payerId: string
    amount: number
    source: 'BANK' | 'CASH'
    imputedToId?: string
  }[]
}

type ExpenseMutateDrawerProps = {
  vehicle: VehicleDetail
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
  const isEdit = !!currentExpense
  const addExpense = useAddExpense(vehicle.id)
  const updateExpense = useUpdateExpense(vehicle.id)
  const isPending = addExpense.isPending || updateExpense.isPending
  const { auth } = useAuthStore()
  const { i18n, t } = useLingui()
  const ownerId = auth.user?.accountNo ?? ''
  const payerOptions = [
    {
      contactId: ownerId,
      firstName: t`Vous`,
      lastName: null as string | null,
    },
    ...vehicle.participants,
  ]

  const payerSchema = useMemo(
    () =>
      z.object({
        payerId: z.string().min(1, t`Sélectionner un participant`),
        amount: z
          .number({ error: t`Requis` })
          .min(0.01, t`Le montant doit être supérieur à 0`),
        source: z.enum(['BANK', 'CASH']),
        imputedToId: z.string().optional(),
      }),
    [t]
  )

  const formSchema = useMemo(
    () =>
      z.object({
        label: z.string().min(1, t`Le libellé est requis`),
        date: z.string().min(1, t`La date est requise`),
        payers: z.array(payerSchema).min(1, t`Au moins un payeur requis`),
      }),
    [t, payerSchema]
  )

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentExpense
      ? {
          label: currentExpense.label,
          date: currentExpense.date.toISOString().split('T')[0],
          payers: currentExpense.payers.map((p) => ({
            payerId: p.payerId,
            amount: centsToEuros(p.amount),
            source: p.source ?? ('BANK' as const),
            imputedToId: p.imputedToId ?? undefined,
          })),
        }
      : {
          label: '',
          date: new Date().toISOString().split('T')[0],
          payers: [
            {
              payerId: '',
              amount: 0,
              source: 'BANK' as const,
              imputedToId: undefined,
            },
          ],
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
    const payload = {
      label: data.label,
      date: data.date,
      // Banque/Espèces only means something for your own payment — a
      // contact's money never touches your tracked balances.
      payers: data.payers.map((p) => ({
        ...p,
        amount: eurosToCents(p.amount),
        source: p.payerId === ownerId ? p.source : undefined,
      })),
    }
    const onSuccess = () => {
      toast.success(isEdit ? t`Dépense modifiée.` : t`Dépense ajoutée.`)
      form.reset()
      onOpenChange(false)
    }
    if (currentExpense) {
      updateExpense.mutate(
        { expenseId: currentExpense.id, ...payload },
        { onSuccess }
      )
      return
    }

    addExpense.mutate(payload, { onSuccess })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <DialogContent className='flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-md'>
        <DialogHeader className='px-6 py-5'>
          <DialogTitle>
            {isEdit ? (
              <Trans>Modifier la dépense</Trans>
            ) : (
              <Trans>Ajouter une dépense</Trans>
            )}
          </DialogTitle>
          <DialogDescription>{vehicle.name}</DialogDescription>
        </DialogHeader>

        <Separator />

        <Form {...form}>
          <form
            id='expense-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5'
          >
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Libellé</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t`Ex : Révision moteur`}
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
                  <FormLabel>
                    <Trans>Date</Trans>
                  </FormLabel>
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
                <p className='text-sm font-medium'>
                  <Trans>Qui a payé ?</Trans>
                </p>
                <span className='text-sm font-medium'>
                  <Trans>
                    Total :{' '}
                    <span className='text-foreground'>
                      {formatEuros(totalAmount, i18n.locale)}
                    </span>
                  </Trans>
                </span>
              </div>

              {fields.map((field, index) => {
                const imputedToId = form.watch(`payers.${index}.imputedToId`)
                const isOwnerPayer =
                  form.watch(`payers.${index}.payerId`) === ownerId
                const otherParticipants = payerOptions.filter(
                  (p) => p.contactId !== form.watch(`payers.${index}.payerId`)
                )
                return (
                  <div key={field.id} className='space-y-1.5'>
                    <div className='flex items-start gap-2'>
                      <div className='flex-1'>
                        <FormField
                          control={form.control}
                          name={`payers.${index}.payerId`}
                          render={({ field: f }) => (
                            <FormItem className='space-y-1'>
                              <SelectDropdown
                                defaultValue={f.value}
                                onValueChange={(v) => {
                                  f.onChange(v)
                                  if (
                                    form.getValues(
                                      `payers.${index}.imputedToId`
                                    ) === v
                                  ) {
                                    form.setValue(
                                      `payers.${index}.imputedToId`,
                                      undefined
                                    )
                                  }
                                }}
                                placeholder={t`Participant`}
                                items={payerOptions.map((p) => ({
                                  label: formatPersonName(
                                    p.firstName,
                                    p.lastName
                                  ),
                                  value: p.contactId,
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
                                  <DecimalInput
                                    placeholder='0'
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
                      {isOwnerPayer && (
                        <div className='w-24'>
                          <FormField
                            control={form.control}
                            name={`payers.${index}.source`}
                            render={({ field: f }) => (
                              <FormItem className='space-y-1'>
                                <Select
                                  value={f.value}
                                  onValueChange={f.onChange}
                                >
                                  <SelectTrigger className='h-9'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='BANK'>
                                      <Trans>Banque</Trans>
                                    </SelectItem>
                                    <SelectItem value='CASH'>
                                      <Trans>Espèces</Trans>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
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

                    {imputedToId ? (
                      <FormField
                        control={form.control}
                        name={`payers.${index}.imputedToId`}
                        render={({ field: f }) => (
                          <FormItem className='ms-1 space-y-1'>
                            <div className='flex items-center gap-2'>
                              <span className='text-xs text-muted-foreground'>
                                <Trans>Pour le compte de</Trans>
                              </span>
                              <div className='flex-1'>
                                <SelectDropdown
                                  defaultValue={f.value ?? ''}
                                  onValueChange={f.onChange}
                                  placeholder={t`Participant`}
                                  items={otherParticipants.map((p) => ({
                                    label: formatPersonName(
                                      p.firstName,
                                      p.lastName
                                    ),
                                    value: p.contactId,
                                  }))}
                                />
                              </div>
                              <button
                                type='button'
                                onClick={() =>
                                  form.setValue(
                                    `payers.${index}.imputedToId`,
                                    undefined
                                  )
                                }
                                className='text-xs text-muted-foreground hover:text-foreground'
                              >
                                <Trans>Annuler</Trans>
                              </button>
                            </div>
                          </FormItem>
                        )}
                      />
                    ) : (
                      <button
                        type='button'
                        className='ms-1 text-xs text-muted-foreground hover:text-foreground'
                        onClick={() =>
                          form.setValue(
                            `payers.${index}.imputedToId`,
                            otherParticipants[0]?.contactId ?? ''
                          )
                        }
                      >
                        <Trans>Payé pour quelqu'un d'autre ?</Trans>
                      </button>
                    )}
                  </div>
                )
              })}

              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-full'
                onClick={() =>
                  append({
                    payerId: '',
                    amount: 0,
                    source: 'BANK' as const,
                    imputedToId: undefined,
                  })
                }
              >
                <PlusIcon size={14} className='me-1' />
                <Trans>Ajouter un payeur</Trans>
              </Button>
            </div>
          </form>
        </Form>

        <Separator />

        <DialogFooter className='px-6 py-4'>
          <DialogClose asChild>
            <Button variant='outline'>
              <Trans>Annuler</Trans>
            </Button>
          </DialogClose>
          <Button form='expense-form' type='submit' disabled={isPending}>
            {isPending ? t`Enregistrement…` : isEdit ? t`Modifier` : t`Ajouter`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
