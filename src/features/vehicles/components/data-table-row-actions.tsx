import { useRouter } from '@tanstack/react-router'
import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Trash2, Eye } from 'lucide-react'
import { Trans, useLingui } from '@lingui/react/macro'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Vehicle } from '../data/schema'
import { useVehicles } from './vehicles-provider'

type DataTableRowActionsProps = {
  row: Row<Vehicle>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useVehicles()
  const router = useRouter()
  const { t } = useLingui()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal size={16} />
          <span className='sr-only'>{t`Ouvrir le menu`}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() =>
            router.navigate({
              to: '/vehicles/$vehicleId',
              params: { vehicleId: row.original.id },
            })
          }
        >
          <Eye size={14} className='me-2' />
          <Trans>Voir la fiche</Trans>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive focus:text-destructive'
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('delete')
          }}
        >
          <Trash2 size={14} className='me-2' />
          <Trans>Supprimer</Trans>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
