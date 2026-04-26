import { useState } from 'react'
import { z } from 'zod'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { Plus, Banknote, Landmark, SplitSquareHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type SourceType = 'bank' | 'cash' | 'both'

export type PaymentRecord = {
  id: string
  amount: number
  date: Date
  note?: string | null
}

export type PaymentDrawerSubmitData = {
  amount: number
  date: string
  note?: string
  source: 'BANK' | 'CASH' | 'BOTH'
  bankSplitAmount?: number
}

type PaymentDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  amountDue: number
  amountPaid: number
  remaining: number
  repayments: PaymentRecord[]
  isPending: boolean
  sourceSelectorLabel?: string
  paidLabel?: string
  remainingLabel?: string
  onSubmit: (data: PaymentDrawerSubmitData) => void
}

const formSchema = z.object({
  amount: z.number().positive('Le montant doit être positif.'),
  date: z.string().min(1, 'La date est requise.'),
  note: z.string().optional(),
  bankSplit: z.number().min(0).optional(),
})
type PaymentForm = z.infer<typeof formSchema>

const fmt = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const SOURCE_OPTIONS: {
  value: SourceType
  label: string
  icon: React.ElementType
}[] = [
  { value: 'bank', label: 'Banque', icon: Landmark },
  { value: 'cash', label: 'Espèces', icon: Banknote },
  { value: 'both', label: 'Les deux', icon: SplitSquareHorizontal },
]

export function PaymentDrawer({
  open,
  onOpenChange,
  title,
  description,
  amountDue,
  amountPaid,
  remaining,
  repayments,
  isPending,
  sourceSelectorLabel = 'Où va cet argent ?',
  paidLabel = 'Remboursé',
  remainingLabel = 'Reste à régler',
  onSubmit,
}: PaymentDrawerProps) {
  const [sourceType, setSourceType] = useState<SourceType | null>(null)

  const progression = Math.min(100, (amountPaid / amountDue) * 100)

  const form = useForm<PaymentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      note: '',
      bankSplit: 0,
    },
  })

  const amount = form.watch('amount') || 0
  const bankSplit = form.watch('bankSplit') || 0
  const cashComputed = Math.max(0, amount - bankSplit)

  const handleReset = () => {
    setSourceType(null)
    form.reset({
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      note: '',
      bankSplit: 0,
    })
  }

  const handleSubmit = (data: PaymentForm) => {
    if (!sourceType) {
      toast.error('Veuillez indiquer où va cet argent.')
      return
    }
    if (sourceType === 'both') {
      const split = data.bankSplit ?? 0
      if (split <= 0 || split >= data.amount) {
        toast.error(
          'Le montant Banque doit être compris entre 0 et le montant versé.'
        )
        return
      }
    }

    onSubmit({
      amount: data.amount,
      date: data.date,
      note: data.note || undefined,
      source:
        sourceType === 'bank'
          ? 'BANK'
          : sourceType === 'cash'
            ? 'CASH'
            : 'BOTH',
      bankSplitAmount:
        sourceType === 'both' ? (data.bankSplit ?? 0) : undefined,
    })
  }

  const sortedRepayments = [...repayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleReset()
        onOpenChange(v)
      }}
    >
      <SheetContent className='flex w-full flex-col sm:w-3/4 sm:max-w-sm'>
        <SheetHeader className='text-start'>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription asChild>
            <span>{description}</span>
          </SheetDescription>
        </SheetHeader>

        <div className='flex flex-col gap-4 overflow-y-auto px-4'>
          {/* Progression */}
          <div className='space-y-3 rounded-lg border p-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>{paidLabel}</span>
              <span className='font-semibold tabular-nums'>
                {fmt.format(amountPaid)} / {fmt.format(amountDue)}
              </span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-secondary'>
              <div
                className='h-full rounded-full bg-primary transition-all'
                style={{ width: `${progression}%` }}
              />
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>{remainingLabel}</span>
              <Badge variant={remaining === 0 ? 'default' : 'secondary'}>
                {fmt.format(remaining)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Formulaire */}
          <div>
            <p className='mb-3 text-sm font-medium'>Enregistrer un versement</p>
            <Form {...form}>
              <form
                id='payment-form'
                onSubmit={form.handleSubmit(handleSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant (€)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          min='0'
                          step='0.01'
                          placeholder='0.00'
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Card className='gap-3 border-0 bg-transparent p-0 shadow-none'>
                  <Label className='text-xs text-muted-foreground'>
                    {sourceSelectorLabel}
                  </Label>
                  <Card className='grid grid-cols-3 gap-2 rounded-none border-0 bg-transparent p-0 shadow-none'>
                    {SOURCE_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <Card
                        key={value}
                        onClick={() => setSourceType(value)}
                        className={cn(
                          'cursor-pointer gap-0 rounded-xl border-2 py-0 shadow-none transition-all',
                          sourceType === value
                            ? 'border-zinc-900 bg-zinc-900'
                            : 'border-muted hover:border-zinc-400'
                        )}
                      >
                        <CardContent className='flex flex-col items-center gap-1.5 p-3'>
                          <Icon
                            size={16}
                            strokeWidth={2}
                            className={
                              sourceType === value
                                ? 'text-white'
                                : 'text-muted-foreground'
                            }
                          />
                          <Label
                            className={cn(
                              'cursor-pointer text-xs font-medium',
                              sourceType === value ? 'text-white' : ''
                            )}
                          >
                            {label}
                          </Label>
                        </CardContent>
                      </Card>
                    ))}
                  </Card>

                  {sourceType === 'both' && (
                    <Card className='gap-3 border-0 bg-transparent p-0 shadow-none'>
                      <FormField
                        control={form.control}
                        name='bankSplit'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-1.5'>
                              <Landmark size={13} /> Banque (€)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type='number'
                                min='0'
                                max={amount}
                                step='0.01'
                                placeholder='0,00'
                                onChange={(e) =>
                                  field.onChange(e.target.valueAsNumber)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Card className='gap-0 rounded-lg p-0 shadow-none'>
                        <CardContent className='flex items-center justify-between px-3 py-2.5'>
                          <CardDescription className='flex items-center gap-1.5'>
                            <Banknote size={13} /> Espèces
                          </CardDescription>
                          <CardTitle className='text-sm font-semibold tabular-nums'>
                            {fmt.format(cashComputed)}
                          </CardTitle>
                        </CardContent>
                      </Card>
                    </Card>
                  )}
                </Card>

                <FormField
                  control={form.control}
                  name='date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type='date' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='note'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Ex : virement, espèces...'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='w-full space-x-1'
                  disabled={isPending}
                >
                  <Plus size={16} />
                  <span>
                    {isPending ? 'Enregistrement...' : 'Ajouter le versement'}
                  </span>
                </Button>
              </form>
            </Form>
          </div>

          <Separator />

          {/* Historique */}
          <div>
            <p className='mb-3 text-sm font-medium'>
              Historique ({repayments.length} versement
              {repayments.length !== 1 ? 's' : ''})
            </p>
            {sortedRepayments.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                Aucun versement enregistré pour l&apos;instant.
              </p>
            ) : (
              <ul className='space-y-2'>
                {sortedRepayments.map((r) => (
                  <li
                    key={r.id}
                    className='flex items-start justify-between rounded-md border px-3 py-2 text-sm'
                  >
                    <div className='flex items-center gap-2'>
                      <Banknote className='size-4 shrink-0 text-muted-foreground' />
                      <div>
                        <p className='font-medium tabular-nums'>
                          {fmt.format(r.amount)}
                        </p>
                        {r.note && (
                          <p className='text-xs text-muted-foreground'>
                            {r.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {format(new Date(r.date), 'd MMM yyyy', { locale: fr })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Fermer</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
