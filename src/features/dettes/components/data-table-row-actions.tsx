import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, Banknote, CheckCircle2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { detteSchema } from '../data/schema'
import { useDettes } from './dettes-provider'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const dette = detteSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useDettes()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Ouvrir le menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {/* update — pas d'endpoint backend pour l'instant
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(dette)
            setOpen('update')
          }}
        >
          Modifier
        </DropdownMenuItem>
        */}
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(dette)
            setOpen('remboursements')
          }}
        >
          Remboursements
          <DropdownMenuShortcut>
            <Banknote size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {dette.isManuallySettled ? (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(dette)
              setOpen('unsettle')
            }}
          >
            Annuler le règlement manuel
            <DropdownMenuShortcut>
              <Undo2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
          !dette.isRepaid && (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(dette)
                setOpen('settle')
              }}
            >
              Marquer comme réglée
              <DropdownMenuShortcut>
                <CheckCircle2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(dette)
            setOpen('delete')
          }}
        >
          Supprimer
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
