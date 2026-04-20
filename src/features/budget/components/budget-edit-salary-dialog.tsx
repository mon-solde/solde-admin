import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

const editSalaryFormSchema = z.object({
  receivedSalary: z
    .number({ error: 'Requis' })
    .min(0, 'Le salaire ne peut pas être négatif'),
})

type EditSalaryFormValues = z.infer<typeof editSalaryFormSchema>

type BudgetEditSalaryDialogProps = {
  currentSalary: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetEditSalaryDialog({
  currentSalary,
  open,
  onOpenChange,
}: BudgetEditSalaryDialogProps) {
  const form = useForm<EditSalaryFormValues>({
    resolver: zodResolver(editSalaryFormSchema),
    defaultValues: { receivedSalary: currentSalary },
  })

  function handleSubmit(_values: EditSalaryFormValues) {
    // TODO: mettre à jour le mouvement "ajout banque" dans l'épargne avec le nouveau montant disponible à épargner
    // (salaire - prélèvements automatiques - actions manuelles payées)
    form.reset()
    onOpenChange(false)
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
                        {...field}
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
          <Button type='submit' form='edit-salary-form'>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
