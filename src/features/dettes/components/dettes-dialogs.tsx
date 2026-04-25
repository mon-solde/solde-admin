import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteDette } from '../api/dettes-api'
import { DettesMutateDrawer } from './dettes-mutate-drawer'
import { useDettes } from './dettes-provider'
import { DettesRemboursementsDrawer } from './dettes-remboursements-drawer'

export function DettesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useDettes()
  const deleteDette = useDeleteDette()

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
            onOpenChange={() => {
              setOpen('remboursements')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
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
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              deleteDette.mutate(currentRow.id, {
                onSuccess: () => {
                  toast.success('Dette supprimée.')
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                },
              })
            }}
            className='max-w-md'
            title={`Supprimer cette dette : ${currentRow.id} ?`}
            desc={
              <>
                Vous allez supprimer la dette avec l&apos;ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                Cette action est irréversible.
              </>
            }
            confirmText='Supprimer'
          />
        </>
      )}
    </>
  )
}
