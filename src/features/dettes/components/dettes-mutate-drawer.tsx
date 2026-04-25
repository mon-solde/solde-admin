import { useState } from 'react'
import { z } from 'zod'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Landmark,
  Banknote,
  SplitSquareHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
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
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { Textarea } from '@/components/ui/textarea'
import { UserCombobox } from '@/features/users/components/user-combobox'
import { useCreateDette } from '../api/dettes-api'

type Role = 'lent' | 'borrowed'
type SourceType = 'bank' | 'cash' | 'both'

const formSchema = z.object({
  personId: z.string().min(1, 'Veuillez sélectionner une personne.'),
  amount: z.number().positive('Le montant doit être positif.'),
  date: z.string().min(1, 'La date est requise.'),
  description: z.string().optional(),
  bankSplit: z.number().min(0).optional(),
})
type DetteForm = z.infer<typeof formSchema>

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

type DettesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DettesMutateDrawer({
  open,
  onOpenChange,
}: DettesMutateDrawerProps) {
  const [role, setRole] = useState<Role | null>(null)
  const [sourceType, setSourceType] = useState<SourceType | null>(null)
  const createDette = useCreateDette()

  const form = useForm<DetteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personId: '',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      bankSplit: 0,
    },
  })

  const amount = form.watch('amount') || 0
  const bankSplit = form.watch('bankSplit') || 0
  const cashComputed = Math.max(0, amount - bankSplit)

  const handleReset = () => {
    setRole(null)
    setSourceType(null)
    form.reset({
      personId: '',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      bankSplit: 0,
    })
  }

  const onSubmit = (data: DetteForm) => {
    if (!role) return

    if (role === 'lent') {
      if (!sourceType) {
        toast.error("Veuillez indiquer d'où vient l'argent.")
        return
      }
      if (sourceType === 'both') {
        const split = data.bankSplit ?? 0
        if (split <= 0 || split >= data.amount) {
          toast.error(
            'Le montant Banque doit être compris entre 0 et le montant total.'
          )
          return
        }
      }
    }

    const bankAmount =
      role === 'lent'
        ? sourceType === 'bank'
          ? data.amount
          : sourceType === 'cash'
            ? 0
            : (data.bankSplit ?? 0)
        : undefined

    const cashAmount =
      role === 'lent'
        ? sourceType === 'cash'
          ? data.amount
          : sourceType === 'bank'
            ? 0
            : data.amount - (data.bankSplit ?? 0)
        : undefined

    createDette.mutate(
      {
        role,
        personId: data.personId,
        amount: data.amount,
        date: data.date,
        description: data.description || undefined,
        bankAmount,
        cashAmount,
      },
      {
        onSuccess: () => {
          toast.success('Dette enregistrée.')
          onOpenChange(false)
          setTimeout(handleReset, 300)
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ?? 'Une erreur est survenue.'
          )
        },
      }
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setTimeout(handleReset, 300)
      }}
    >
      <SheetContent className='flex w-full flex-col gap-0 p-0 sm:w-3/4 sm:max-w-sm [&>button:last-child]:hidden'>
        {/* Header */}
        <SheetHeader className='flex-row items-center gap-3 space-y-0 px-6 py-5'>
          <Card className='flex size-9 shrink-0 items-center justify-center gap-0 rounded-xl border-0 bg-zinc-900 p-0 shadow-none'>
            <CardContent className='p-0'>
              <DollarSign className='text-white' size={18} strokeWidth={2.2} />
            </CardContent>
          </Card>
          <Card className='flex-1 gap-0.5 border-0 bg-transparent p-0 shadow-none'>
            <SheetTitle className='text-sm leading-tight font-semibold'>
              Nouvelle dette
            </SheetTitle>
            <SheetDescription className='text-xs'>
              Enregistrez un prêt ou un emprunt
            </SheetDescription>
          </Card>
          <SheetClose asChild>
            <Button
              variant='ghost'
              size='icon'
              className='ml-auto size-8 shrink-0 rounded-lg'
            >
              ✕
            </Button>
          </SheetClose>
        </SheetHeader>

        <Separator />

        {/* Body */}
        <ScrollArea className='flex-1'>
          <Card className='gap-6 rounded-none border-0 bg-transparent px-6 py-6 shadow-none'>
            {/* Sélection du rôle */}
            <Card className='gap-2 border-0 bg-transparent p-0 shadow-none'>
              <Label className='text-xs text-muted-foreground'>
                Quel est votre rôle ?
              </Label>
              <Card className='grid grid-cols-2 gap-3 rounded-none border-0 bg-transparent p-0 shadow-none'>
                <Card
                  onClick={() => setRole('lent')}
                  className={cn(
                    'cursor-pointer gap-0 rounded-2xl border-2 py-0 transition-all',
                    role === 'lent'
                      ? 'border-emerald-600 bg-emerald-600'
                      : 'border-role-lent-border bg-role-lent-bg'
                  )}
                >
                  <CardContent className='flex flex-col items-start gap-2 p-4'>
                    <ArrowUpRight
                      size={20}
                      strokeWidth={2.5}
                      className={
                        role === 'lent' ? 'text-white' : 'text-emerald-600'
                      }
                    />
                    <Card className='gap-0.5 border-0 bg-transparent p-0 shadow-none'>
                      <CardTitle
                        className={cn(
                          'text-sm',
                          role === 'lent' ? 'text-white' : ''
                        )}
                      >
                        J'ai prêté
                      </CardTitle>
                      <CardDescription
                        className={cn(
                          'text-[11px]',
                          role === 'lent' ? 'text-white/70' : ''
                        )}
                      >
                        Quelqu'un me doit de l'argent
                      </CardDescription>
                    </Card>
                  </CardContent>
                </Card>

                <Card
                  onClick={() => setRole('borrowed')}
                  className={cn(
                    'cursor-pointer gap-0 rounded-2xl border-2 py-0 transition-all',
                    role === 'borrowed'
                      ? 'border-rose-500 bg-rose-500'
                      : 'border-role-borrowed-border bg-role-borrowed-bg'
                  )}
                >
                  <CardContent className='flex flex-col items-start gap-2 p-4'>
                    <ArrowDownLeft
                      size={20}
                      strokeWidth={2.5}
                      className={
                        role === 'borrowed' ? 'text-white' : 'text-rose-500'
                      }
                    />
                    <Card className='gap-0.5 border-0 bg-transparent p-0 shadow-none'>
                      <CardTitle
                        className={cn(
                          'text-sm',
                          role === 'borrowed' ? 'text-white' : ''
                        )}
                      >
                        J'ai emprunté
                      </CardTitle>
                      <CardDescription
                        className={cn(
                          'text-[11px]',
                          role === 'borrowed' ? 'text-white/70' : ''
                        )}
                      >
                        Je dois de l'argent à quelqu'un
                      </CardDescription>
                    </Card>
                  </CardContent>
                </Card>
              </Card>
            </Card>

            {/* Champs — apparaissent après sélection du rôle */}
            <Card
              className={cn(
                'gap-5 border-0 bg-transparent p-0 shadow-none transition-all duration-200',
                role
                  ? 'pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-2 opacity-0'
              )}
            >
              <Form {...form}>
                <form
                  id='dettes-form'
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='flex flex-col gap-5'
                >
                  <FormField
                    control={form.control}
                    name='personId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>À qui ?</FormLabel>
                        <FormControl>
                          <UserCombobox
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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

                  {/* Pattern C — Source (prêt uniquement) */}
                  {role === 'lent' && (
                    <Card className='gap-3 border-0 bg-transparent p-0 shadow-none'>
                      <Label className='text-xs text-muted-foreground'>
                        D'où vient l'argent ?
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
                  )}

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
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Description{' '}
                          <span className='font-normal text-muted-foreground'>
                            (optionnel)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder='Contexte, raison du prêt...'
                            className='resize-none'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </Card>
          </Card>
        </ScrollArea>

        <Separator />

        {/* Footer */}
        <SheetFooter className='flex flex-col gap-2 px-6 py-4'>
          <Button
            form='dettes-form'
            type='submit'
            disabled={!role || createDette.isPending}
            className='h-11 w-full rounded-xl font-semibold'
          >
            {createDette.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <SheetClose asChild>
            <Button
              type='button'
              variant='ghost'
              disabled={createDette.isPending}
              className='h-11 w-full rounded-xl'
            >
              Annuler
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
