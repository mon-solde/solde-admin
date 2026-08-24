import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLingui } from '@lingui/react/macro'
import { msg } from '@lingui/core/macro'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { detteStatuses } from '../data/data'
import { type Dette } from '../data/schema'
import { DettesMultiDeleteDialog } from './dettes-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const { i18n, t } = useLingui()

  const handleBulkStatusChange = (_status: string) => {
    const selectedDettes = selectedRows.map((row) => row.original as Dette)
    toast.promise(sleep(2000), {
      loading: t`Mise à jour du statut...`,
      success: () => {
        table.resetRowSelection()
        return t`Statut mis à jour pour ${selectedDettes.length} dette${selectedDettes.length > 1 ? 's' : ''}.`
      },
      error: t`Erreur`,
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName={msg`dette`}>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label={t`Changer le statut`}
                >
                  <CheckCircle2 />
                  <span className='sr-only'>{t`Changer le statut`}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t`Changer le statut`}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {detteStatuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
              >
                {status.icon && (
                  <status.icon className='size-4 text-muted-foreground' />
                )}
                {i18n._(status.label)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label={t`Supprimer les dettes sélectionnées`}
            >
              <Trash2 />
              <span className='sr-only'>
                {t`Supprimer les dettes sélectionnées`}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t`Supprimer les dettes sélectionnées`}</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <DettesMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
