import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

const addMovementSchema = z.object({
  kind: z.union([z.literal('addition'), z.literal('withdrawal')]),
  source: z.union([z.literal('bank'), z.literal('cash')]),
  amount: z.number({ error: 'Requis' }).min(0.01, 'Montant requis'),
  label: z.string().min(1, 'Libellé requis'),
  date: z.string().min(1, 'Date requise'),
})

type AddMovementValues = z.infer<typeof addMovementSchema>

type SavingsActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SavingsActionDialog({
  open,
  onOpenChange,
}: SavingsActionDialogProps) {
  const { addMovement } = useSavings()

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
          <DialogTitle>Ajouter un mouvement</DialogTitle>
          <DialogDescription>
            Enregistrez un ajout ou retrait sur votre épargne.
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
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='addition'>Ajout</SelectItem>
                        <SelectItem value='withdrawal'>Retrait</SelectItem>
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
                    <FormLabel>Compte</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant</FormLabel>
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
                    <FormLabel>Date</FormLabel>
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
                  <FormLabel>Libellé</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex : Aide maman, remboursement dette...'
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
          <Button type='submit' form='savings-add-form'>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
