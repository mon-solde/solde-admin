import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { useUpdateSalary } from '../api/budget-api'

const editSalaryFormSchema = z.object({
  receivedSalary: z
    .number({ error: 'Requis' })
    .min(0, 'Le salaire ne peut pas être négatif'),
})

type EditSalaryFormValues = z.infer<typeof editSalaryFormSchema>

type BudgetEditSalaryDialogProps = {
  budgetId: string | undefined
  currentSalary: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetEditSalaryDialog({
  budgetId,
  currentSalary,
  open,
  onOpenChange,
}: BudgetEditSalaryDialogProps) {
  const { mutate: updateSalary, isPending } = useUpdateSalary()

  const form = useForm<EditSalaryFormValues>({
    resolver: zodResolver(editSalaryFormSchema),
    defaultValues: { receivedSalary: currentSalary },
  })

  function handleSubmit(values: EditSalaryFormValues) {
    if (!budgetId) return
    updateSalary(
      { id: budgetId, receivedSalary: values.receivedSalary },
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
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Modifier le salaire</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id='edit-salary-form'
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='receivedSalary'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Salaire reçu
                  </FormLabel>
                  <FormControl>
                    <div className='relative col-span-4'>
                      <Input
                        type='number'
                        step='0.01'
                        min='0'
                        placeholder='1 384,17'
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
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
        <DialogFooter>
          <Button type='submit' form='edit-salary-form' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
