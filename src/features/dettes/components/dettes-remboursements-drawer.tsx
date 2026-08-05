import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { PaymentDrawer } from '@/components/payment-drawer'
import {
  useAddRepayment,
  useDeleteRepayment,
  useGetDettes,
} from '../api/dettes-api'
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
  const deleteRepayment = useDeleteRepayment()
  const { data: dettes = [] } = useGetDettes()
  const { auth } = useAuthStore()
  const accountNo = auth.user?.accountNo ?? ''
  const dette = dettes.find((d) => d.id === currentRow.id) ?? currentRow
  const isLender = dette.role === 'lent'
  const lenderLabel = dette.lenderId === accountNo ? 'Vous' : dette.lenderName
  const borrowerLabel =
    dette.borrowerId === accountNo ? 'Vous' : dette.borrowerName

  return (
    <PaymentDrawer
      open={open}
      onOpenChange={onOpenChange}
      title='Remboursements'
      description={
        <>
          <strong>{lenderLabel}</strong> a prêté{' '}
          <strong>
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(dette.amount)}
          </strong>{' '}
          à <strong>{borrowerLabel}</strong>
        </>
      }
      amountDue={dette.amount}
      amountPaid={dette.totalRepaid}
      remaining={dette.remaining}
      repayments={dette.repayments}
      isPending={addRepayment.isPending}
      onDeleteRepayment={(repaymentId) =>
        deleteRepayment.mutate(
          { debtId: dette.id, repaymentId },
          {
            onSuccess: () => toast.success('Versement supprimé.'),
            onError: (error: any) =>
              toast.error(
                error?.response?.data?.message ?? 'Une erreur est survenue.'
              ),
          }
        )
      }
      // A repayment reverses the original debt's money direction: on a debt
      // you lent, the repayment flows back to you (same question as
      // borrowing — "où va l'argent"), and vice versa. See the create-debt
      // form (dettes-mutate-drawer.tsx) for the non-reversed version of this
      // question.
      sourceSelectorLabel={
        isLender ? 'Où avez-vous reçu cet argent ?' : "D'où vient cet argent ?"
      }
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
