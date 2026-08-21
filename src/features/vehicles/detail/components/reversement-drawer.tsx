import { toast } from 'sonner'
import { centsToEuros, eurosToCents } from '@/lib/money'
import { formatPersonName } from '@/lib/utils'
import { PaymentDrawer } from '@/components/payment-drawer'
import { useAddReversement } from '../../api/vehicles-api'
import { type Reversement } from '../../data/schema'

type ReversementDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reversement: Reversement
  vehicleId: string
  vehicleName: string
}

export function ReversementDrawer({
  open,
  onOpenChange,
  reversement,
  vehicleId,
  vehicleName,
}: ReversementDrawerProps) {
  const { mutate: addReversement, isPending } = useAddReversement(vehicleId)
  // LENDER means you're owed (the contact pays you back), BORROWER means
  // you owe (you pay the contact) — same distinction as the Dettes
  // remboursements drawer, which this mirrors.
  const isOwnerLender = reversement.direction === 'LENDER'
  const contactName = formatPersonName(
    reversement.contactFirstName,
    reversement.contactLastName
  )

  return (
    <PaymentDrawer
      open={open}
      onOpenChange={onOpenChange}
      title='Remboursements'
      description={
        <>
          {isOwnerLender ? 'Remboursement de' : 'Reversement à'}{' '}
          <strong>{contactName}</strong> — <strong>{reversement.origin}</strong>{' '}
          ({vehicleName})
        </>
      }
      amountDue={centsToEuros(reversement.amountDue)}
      amountPaid={centsToEuros(reversement.amountPaid)}
      remaining={centsToEuros(reversement.remaining)}
      repayments={reversement.repayments.map((r) => ({
        ...r,
        amount: centsToEuros(r.amount),
      }))}
      isPending={isPending}
      // Same reversed question as create-debt/remboursements-drawer: when
      // you're owed, the money comes in ("où l'avez-vous reçu"); when you
      // owe, it goes out ("d'où vient-il pour payer").
      sourceSelectorLabel={
        isOwnerLender ? 'Où avez-vous reçu cet argent ?' : "D'où vient cet argent ?"
      }
      paidLabel='Versé'
      remainingLabel='Reste à verser'
      onSubmit={(data) =>
        addReversement(
          {
            debtId: reversement.debtId,
            ...data,
            amount: eurosToCents(data.amount),
            bankSplitAmount:
              data.bankSplitAmount !== undefined
                ? eurosToCents(data.bankSplitAmount)
                : undefined,
          },
          {
            onSuccess: () => toast.success('Versement enregistré.'),
            onError: (error: any) =>
              toast.error(
                error?.response?.data?.message ?? 'Une erreur est survenue.'
              ),
          }
        )
      }
    />
  )
}
