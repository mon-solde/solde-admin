import { Trans, useLingui } from '@lingui/react/macro'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  useDeleteDette,
  useSetDebtSettled,
  useSetDebtForgiven,
} from '../api/dettes-api'
import { DettesMutateDrawer } from './dettes-mutate-drawer'
import { useDettes } from './dettes-provider'
import { DettesRemboursementsDrawer } from './dettes-remboursements-drawer'

export function DettesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useDettes()
  const deleteDette = useDeleteDette()
  const setDebtSettled = useSetDebtSettled()
  const setDebtForgiven = useSetDebtForgiven()
  const { t } = useLingui()

  // Closes (or toggles) a dialog, then clears `currentRow` once its exit
  // animation has had time to finish — clearing it immediately would blank
  // the dialog's content while it's still visibly closing.
  const closeDialog = (key: Parameters<typeof setOpen>[0] = null) => {
    setOpen(key)
    setTimeout(() => setCurrentRow(null), 500)
  }

  return (
    <>
      <DettesMutateDrawer
        key='dette-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <DettesRemboursementsDrawer
            key={`dette-remboursements-${currentRow.id}`}
            open={open === 'remboursements'}
            onOpenChange={() => closeDialog('remboursements')}
            currentRow={currentRow}
          />

          {/* update — pas d'endpoint backend pour l'instant
          <DettesMutateDrawer
            key={`dette-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
          */}

          <ConfirmDialog
            key='dette-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => closeDialog('delete')}
            handleConfirm={() => {
              deleteDette.mutate(currentRow.id, {
                onSuccess: () => {
                  toast.success(t`Dette supprimée.`)
                  closeDialog()
                },
              })
            }}
            className='max-w-md'
            title={t`Supprimer cette dette : ${currentRow.id} ?`}
            desc={
              <Trans>
                Vous allez supprimer la dette avec l&apos;ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                Cette action est irréversible.
              </Trans>
            }
            confirmText={t`Supprimer`}
          />

          <ConfirmDialog
            key='dette-settle'
            open={open === 'settle'}
            onOpenChange={() => closeDialog('settle')}
            handleConfirm={() => {
              setDebtSettled.mutate(
                { debtId: currentRow.id, settled: true },
                {
                  onSuccess: () => {
                    toast.success(t`Dette marquée comme réglée.`)
                    closeDialog()
                  },
                }
              )
            }}
            isLoading={setDebtSettled.isPending}
            className='max-w-md'
            title={t`Marquer cette dette comme réglée ?`}
            desc={
              <Trans>
                Elle sera considérée comme réglée même si le montant remboursé
                ne correspond pas exactement au montant dû. Aucun nouveau
                remboursement ne pourra être ajouté tant que ce n&apos;est pas
                annulé.
              </Trans>
            }
            confirmText={t`Marquer comme réglée`}
          />

          <ConfirmDialog
            key='dette-unsettle'
            open={open === 'unsettle'}
            onOpenChange={() => closeDialog('unsettle')}
            handleConfirm={() => {
              setDebtSettled.mutate(
                { debtId: currentRow.id, settled: false },
                {
                  onSuccess: () => {
                    toast.success(t`Règlement manuel annulé.`)
                    closeDialog()
                  },
                }
              )
            }}
            isLoading={setDebtSettled.isPending}
            className='max-w-md'
            title={t`Annuler le règlement manuel de cette dette ?`}
            desc={
              <Trans>
                Elle repassera &quot;en cours&quot; si le montant remboursé
                n&apos;atteint pas le montant dû.
              </Trans>
            }
            confirmText={t`Annuler le règlement`}
          />

          <ConfirmDialog
            key='dette-forgive'
            open={open === 'forgive'}
            onOpenChange={() => closeDialog('forgive')}
            handleConfirm={() => {
              setDebtForgiven.mutate(
                { debtId: currentRow.id, forgiven: true },
                {
                  onSuccess: () => {
                    toast.success(t`Dette pardonnée.`)
                    closeDialog()
                  },
                }
              )
            }}
            isLoading={setDebtForgiven.isPending}
            className='max-w-md'
            title={t`Pardonner cette dette ?`}
            desc={
              <Trans>
                Elle ne sera plus considérée comme due, sans qu&apos;aucun
                remboursement n&apos;ait eu lieu. Aucun nouveau remboursement ne
                pourra être ajouté tant que ce n&apos;est pas annulé.
              </Trans>
            }
            confirmText={t`Pardonner`}
          />

          <ConfirmDialog
            key='dette-unforgive'
            open={open === 'unforgive'}
            onOpenChange={() => closeDialog('unforgive')}
            handleConfirm={() => {
              setDebtForgiven.mutate(
                { debtId: currentRow.id, forgiven: false },
                {
                  onSuccess: () => {
                    toast.success(t`Pardon annulé.`)
                    closeDialog()
                  },
                }
              )
            }}
            isLoading={setDebtForgiven.isPending}
            className='max-w-md'
            title={t`Annuler le pardon de cette dette ?`}
            desc={<Trans>Elle redeviendra due, comme avant.</Trans>}
            confirmText={t`Annuler le pardon`}
          />
        </>
      )}
    </>
  )
}
