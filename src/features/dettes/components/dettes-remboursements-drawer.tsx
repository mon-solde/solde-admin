import { toast } from 'sonner'
import { centsToEuros, eurosToCents } from '@/lib/money'
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
  // Not a table — this only needs to look up one debt by id after a
  // mutation, so it asks for every debt (no status filter, a generous page
  // size) rather than relying on whatever page/filters the table happens
  // to be on, which could easily not contain this debt.
  const { data: page } = useGetDettes({ status: 'tous', pageSize: 1000 })
  const { auth } = useAuthStore()
  const accountNo = auth.user?.accountNo ?? ''
  const dette = page?.data.find((d) => d.id === currentRow.id) ?? currentRow
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
            }).format(centsToEuros(dette.amount))}
          </strong>{' '}
          à <strong>{borrowerLabel}</strong>
        </>
      }
      amountDue={centsToEuros(dette.amount)}
      amountPaid={centsToEuros(dette.totalRepaid)}
      remaining={centsToEuros(dette.remaining)}
      repayments={dette.repayments.map((r) => ({
        ...r,
        amount: centsToEuros(r.amount),
      }))}
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
          {
            debtId: dette.id,
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
