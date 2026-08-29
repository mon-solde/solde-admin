import { type Table } from '@tanstack/react-table'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { Trash2 } from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { ContactsMultiDeleteDialog } from './contacts-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useDialogState<boolean>(false)
  const { t } = useLingui()

  return (
    <>
      <BulkActionsToolbar table={table} entityName={msg`contact`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label={t`Supprimer les contacts sélectionnés`}
              title={t`Supprimer les contacts sélectionnés`}
            >
              <Trash2 />
              <span className='sr-only'>
                <Trans>Supprimer les contacts sélectionnés</Trans>
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              <Trans>Supprimer les contacts sélectionnés</Trans>
            </p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ContactsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm ?? false}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
