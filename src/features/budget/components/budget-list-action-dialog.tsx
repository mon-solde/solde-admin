import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
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
import { Input } from '@/components/ui/input'
import { subscriptions } from '@/features/subscriptions/data/subscriptions'
import { FRENCH_MONTHS } from '../data/data'
import { getNextAvailableMonth } from '../data/monthly-budgets'
import { useBudgetList } from './budget-list-provider'

const formSchema = z.object({
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
  const { budgets, addBudget } = useBudgetList()
  const navigate = useNavigate()
  const { month, year } = getNextAvailableMonth(budgets)

  const form = useForm<BudgetListActionDialogForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { receivedSalary: 0 },
  })

  const onSubmit = (values: BudgetListActionDialogForm) => {
    const activeManualSubscriptions = subscriptions.filter(
      (s) => s.status === 'active' && s.paymentType === 'manual'
    )

    const budget = {
      id: `budget-${year}-${month}`,
      month,
      year,
      receivedSalary: values.receivedSalary,
      savingsWithdrawals: [],
      manualActionEntries: activeManualSubscriptions.map((s) => ({
        subscriptionId: s.id,
        label: s.name,
        plannedAmount: s.amount,
        payments: [],
      })),
    }

    // TODO: créer un mouvement "ajout banque" dans l'épargne avec le montant disponible à épargner
    // (salaire - prélèvements automatiques - actions manuelles payées, soit availableForSavings)
    addBudget(budget)
    form.reset()
    onOpenChange(false)
    navigate({ to: '/budget/detail', search: { year, month } })
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
            Créer le budget pour {FRENCH_MONTHS[month - 1]} {year}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='budget-add-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
              <FormLabel className='col-span-2 text-end'>Mois</FormLabel>
              <div className='col-span-4 text-sm'>
                {FRENCH_MONTHS[month - 1]} {year}
              </div>
            </FormItem>
            <FormField
              control={form.control}
              name='receivedSalary'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Salaire reçu
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      placeholder='1384.17'
                      className='col-span-4'
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='budget-add-form'>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
