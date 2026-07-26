import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { ContactsMultiDeleteDialog } from './contacts-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BulkActionsToolbar table={table} entityName='contact'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Supprimer les contacts sélectionnés'
              title='Supprimer les contacts sélectionnés'
            >
              <Trash2 />
              <span className='sr-only'>
                Supprimer les contacts sélectionnés
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Supprimer les contacts sélectionnés</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ContactsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
