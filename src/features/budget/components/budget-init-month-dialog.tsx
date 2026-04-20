import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { subscriptions } from '@/features/subscriptions/data/subscriptions'

const FRENCH_MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

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
  const activeManualSubscriptions = subscriptions.filter(
    (s) => s.status === 'active' && s.paymentType === 'manual'
  )

  function handleConfirm() {
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Initialiser {FRENCH_MONTHS[month - 1]} {year}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className='space-y-2'>
              <p>
                Les actions manuelles suivantes seront créées pour ce mois :
              </p>
              <ul className='list-inside list-disc space-y-1'>
                {activeManualSubscriptions.map((s) => (
                  <li key={s.id} className='text-foreground'>
                    {s.name}{' '}
                    <span className='text-muted-foreground'>
                      — prévu {s.amount.toLocaleString('fr-FR')} €
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Initialiser
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
