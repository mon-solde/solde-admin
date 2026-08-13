import { type Row } from '@tanstack/react-table'
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
          <span className='sr-only'>Ouvrir le menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={toggleStatus} disabled={isToggling}>
          {isToggling ? (
            <>
              <Loader2 size={14} className='me-2 animate-spin' />
              {charge.isActive ? 'Désactivation...' : 'Activation...'}
            </>
          ) : charge.isActive ? (
            <>
              <PauseCircle size={14} className='me-2' />
              Désactiver
            </>
          ) : (
            <>
              <PlayCircle size={14} className='me-2' />
              Activer
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openEditDialog}>
          <Pencil size={14} className='me-2' />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive focus:text-destructive'
          onClick={openDeleteDialog}
        >
          <Trash2 size={14} className='me-2' />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
