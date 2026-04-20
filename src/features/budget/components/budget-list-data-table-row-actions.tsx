import { useNavigate } from '@tanstack/react-router'
import { type Row } from '@tanstack/react-table'
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type MonthlyBudget } from '../data/schema'
import { useBudgetList } from './budget-list-provider'

type DataTableRowActionsProps = {
  row: Row<MonthlyBudget>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useBudgetList()
  const navigate = useNavigate()

  function openDetail() {
    navigate({
      to: '/budget/detail',
      search: { year: row.original.year, month: row.original.month },
    })
  }

  function openDeleteDialog() {
    setCurrentRow(row.original)
    setOpen('delete')
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
        <DropdownMenuItem onClick={openDetail}>
          <Eye size={14} className='me-2' />
          Voir le détail
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
