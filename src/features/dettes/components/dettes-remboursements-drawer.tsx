import { toast } from 'sonner'
import { PaymentDrawer } from '@/components/payment-drawer'
import { useAddRepayment, useGetDettes } from '../api/dettes-api'
import { type Dette } from '../data/schema'

type DettesRemboursementsDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Dette
}

export function DettesRemboursementsDrawer({
  open,
  onOpenChange,
  currentRow,
}: DettesRemboursementsDrawerProps) {
  const addRepayment = useAddRepayment()
  const { data: dettes = [] } = useGetDettes()
  const dette = dettes.find((d) => d.id === currentRow.id) ?? currentRow
  const isLender = dette.role === 'lent'

  return (
    <PaymentDrawer
      open={open}
      onOpenChange={onOpenChange}
      title='Remboursements'
      description={
        <>
          <strong>{dette.lenderName}</strong> a prêté{' '}
          <strong>
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(dette.amount)}
          </strong>{' '}
          à <strong>{dette.borrowerName}</strong>
        </>
      }
      amountDue={dette.amount}
      amountPaid={dette.totalRepaid}
      remaining={dette.remaining}
      repayments={dette.repayments}
      isPending={addRepayment.isPending}
      sourceSelectorLabel={isLender ? "D'où vient cet argent ?" : 'Où va cet argent ?'}
      paidLabel='Remboursé'
      remainingLabel='Reste à régler'
      onSubmit={(data) =>
        addRepayment.mutate(
          { debtId: dette.id, ...data },
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
