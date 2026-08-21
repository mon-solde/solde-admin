import { toast } from 'sonner'
import { centsToEuros, eurosToCents } from '@/lib/money'
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

  return (
    <PaymentDrawer
      open={open}
      onOpenChange={onOpenChange}
      title='Remboursements'
      description={
        <>
          Reversement à{' '}
          <strong>
            {reversement.recipientFirstName} {reversement.recipientLastName}
          </strong>{' '}
          — <strong>{vehicleName}</strong>
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
      sourceSelectorLabel="D'où vient cet argent ?"
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
