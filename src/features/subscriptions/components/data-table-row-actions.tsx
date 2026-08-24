import { type Row } from '@tanstack/react-table'
import { Trans } from '@lingui/react/macro'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  PlayCircle,
  PauseCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useActivateRecurringCharge,
  useDeactivateRecurringCharge,
} from '../api/subscriptions-api'
import { type Subscription } from '../data/schema'
import { useSubscriptions } from './subscriptions-provider'

type DataTableRowActionsProps = {
  row: Row<Subscription>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useSubscriptions()
  const { mutate: activate, isPending: isActivating } =
    useActivateRecurringCharge()
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateRecurringCharge()

  const charge = row.original
  const isToggling = isActivating || isDeactivating

  function openEditDialog() {
    setCurrentRow(charge)
    setOpen('edit')
  }

  function openDeleteDialog() {
    setCurrentRow(charge)
    setOpen('delete')
  }

  function toggleStatus() {
    if (charge.isActive) {
      deactivate(charge.id)
    } else {
      activate(charge.id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal size={16} />
          <span className='sr-only'>
            <Trans>Ouvrir le menu</Trans>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={toggleStatus} disabled={isToggling}>
          {isToggling ? (
            <>
              <Loader2 size={14} className='me-2 animate-spin' />
              {charge.isActive ? (
                <Trans>Désactivation...</Trans>
              ) : (
                <Trans>Activation...</Trans>
              )}
            </>
          ) : charge.isActive ? (
            <>
              <PauseCircle size={14} className='me-2' />
              <Trans>Désactiver</Trans>
            </>
          ) : (
            <>
              <PlayCircle size={14} className='me-2' />
              <Trans>Activer</Trans>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openEditDialog}>
          <Pencil size={14} className='me-2' />
          <Trans>Modifier</Trans>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive focus:text-destructive'
          onClick={openDeleteDialog}
        >
          <Trash2 size={14} className='me-2' />
          <Trans>Supprimer</Trans>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
