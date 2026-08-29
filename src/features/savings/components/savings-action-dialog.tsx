import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trans, useLingui } from '@lingui/react/macro'
import { Loader2 } from 'lucide-react'
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
import { getTodayAsInputValue } from '../data/data'
import { useSavings } from './savings-provider'

type AddMovementValues = {
  kind: 'addition' | 'withdrawal'
  source: 'bank' | 'cash'
  amount: number
  label: string
  date: string
}

type SavingsActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SavingsActionDialog({
  open,
  onOpenChange,
}: SavingsActionDialogProps) {
  const { addMovement, isAddingMovement } = useSavings()
  const { t } = useLingui()

  const addMovementSchema = useMemo(
    () =>
      z.object({
        kind: z.union([z.literal('addition'), z.literal('withdrawal')]),
        source: z.union([z.literal('bank'), z.literal('cash')]),
        amount: z.number({ error: t`Requis` }).min(0.01, t`Montant requis`),
        label: z.string().min(1, t`Libellé requis`),
        date: z.string().min(1, t`Date requise`),
      }),
    [t]
  )

  const form = useForm<AddMovementValues>({
    resolver: zodResolver(addMovementSchema),
    defaultValues: {
      kind: 'withdrawal',
      source: 'cash',
      amount: 0,
      label: '',
      date: getTodayAsInputValue(),
    },
  })

  function handleSubmit(values: AddMovementValues) {
    addMovement(
      {
        kind: values.kind,
        source: values.source,
        amount: values.amount,
        label: values.label,
        date: new Date(values.date),
      },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
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
        <DialogHeader>
          <DialogTitle>
            <Trans>Ajouter un mouvement</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Enregistrez un ajout ou retrait sur votre épargne.</Trans>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='savings-add-form'
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='kind'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans>Type</Trans>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='addition'>
                          <Trans>Ajout</Trans>
                        </SelectItem>
                        <SelectItem value='withdrawal'>
                          <Trans>Retrait</Trans>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='source'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans>Compte</Trans>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='bank'>
                          <Trans>Banque</Trans>
                        </SelectItem>
                        <SelectItem value='cash'>
                          <Trans>Espèces</Trans>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans>Montant</Trans>
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <DecimalInput placeholder='0' {...field} />
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
            </div>
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
                      placeholder={t`Ex : Aide maman, remboursement dette...`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='savings-add-form'
            disabled={isAddingMovement}
          >
            {isAddingMovement && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            <Trans>Enregistrer</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
