import { useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  FileSpreadsheet,
  Pencil,
  PlusIcon,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { formatWeekdayDayMonth } from '@/lib/dates'
import { centsToEuros, formatEuros } from '@/lib/money'
import { formatPersonName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Expense, type VehicleDetail } from '../../data/schema'
import { exportVehicleInvestmentsToExcel } from '../lib/export-investments'
import { PayersCell } from './payers-cell'

type ExpenseGroup = { dateKey: string; date: Date; expenses: Expense[] }

type VehicleExpensesSectionProps = {
  vehicle: VehicleDetail
  isSold: boolean
  ownerId: string
  onDeclareSold: () => void
  onAddExpense: () => void
  onEditExpense: (expense: Expense) => void
  onDeleteExpense: (expense: Expense) => void
}

export function VehicleExpensesSection({
  vehicle,
  isSold,
  ownerId,
  onDeclareSold,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}: VehicleExpensesSectionProps) {
  const { i18n, t } = useLingui()
  const [expenseSearch, setExpenseSearch] = useState('')
  const [payerFilter, setPayerFilter] = useState('all')

  // Filtered client-side, not through the backend like the vehicles/dettes
  // tables: `vehicle.expenses` is already fetched in full here (no
  // pagination on this list — a single vehicle realistically accumulates
  // a few dozen expenses over its lifetime, never enough to need it), so
  // there's no request to debounce or extra round-trip to save.
  const normalizedSearch = expenseSearch.trim().toLowerCase()
  const filteredExpenses = vehicle.expenses.filter((e) => {
    const matchesSearch =
      !normalizedSearch || e.label.toLowerCase().includes(normalizedSearch)
    // Match on the responsible party (imputedToId ?? payerId), not the raw
    // payer — money someone fronts but delegates isn't really their own
    // payment, it's the delegate's (who already owes it back via a
    // separate debt; see profit-sharing.ts's computeInvestedByResponsibleParty
    // for the same rule on the backend). A multi-payer expense matches as
    // soon as the searched participant is responsible for one of the
    // payments, regardless of the others.
    const matchesPayer =
      payerFilter === 'all' ||
      e.payers.some((p) => (p.imputedToId ?? p.payerId) === payerFilter)
    return matchesSearch && matchesPayer
  })
  const hasActiveFilter = Boolean(normalizedSearch) || payerFilter !== 'all'
  const resetExpenseFilters = () => {
    setExpenseSearch('')
    setPayerFilter('all')
  }

  // `vehicle.expenses` is already sorted by the backend (date desc, then
  // createdAt desc as a same-day tie-break), so consecutive same-day
  // expenses always land in the same group here.
  const expenseGroups: ExpenseGroup[] = []
  for (const expense of filteredExpenses) {
    const dateKey = expense.date.toDateString()
    const lastGroup = expenseGroups[expenseGroups.length - 1]
    if (lastGroup?.dateKey === dateKey) {
      lastGroup.expenses.push(expense)
    } else {
      expenseGroups.push({ dateKey, date: expense.date, expenses: [expense] })
    }
  }

  return (
    <div className='min-w-0 space-y-3 lg:col-span-2'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>
          <Trans>Dépenses</Trans>
        </h3>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='gap-1'
            onClick={() => {
              void exportVehicleInvestmentsToExcel(vehicle, ownerId)
            }}
          >
            <FileSpreadsheet size={14} />
            <Trans>Exporter Excel</Trans>
          </Button>
          {!isSold && (
            <Button
              variant='outline'
              size='sm'
              className='gap-1'
              onClick={onDeclareSold}
            >
              <TrendingUp size={14} />
              <Trans>Déclarer vendu</Trans>
            </Button>
          )}
          {!isSold && (
            <Button size='sm' className='gap-1' onClick={onAddExpense}>
              <PlusIcon size={14} />
              <Trans>Ajouter</Trans>
            </Button>
          )}
        </div>
      </div>

      <div className='flex flex-wrap gap-2'>
        <Input
          placeholder={t`Filtrer par nom...`}
          value={expenseSearch}
          onChange={(event) => setExpenseSearch(event.target.value)}
          className='h-8 w-full sm:w-[250px]'
        />
        <Select value={payerFilter} onValueChange={setPayerFilter}>
          <SelectTrigger className='h-8 w-full sm:w-[180px]'>
            <SelectValue placeholder={t`Participant`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              <Trans>Tous les participants</Trans>
            </SelectItem>
            <SelectItem value={ownerId}>{t`Vous`}</SelectItem>
            {vehicle.participants.map((p) => (
              <SelectItem key={p.contactId} value={p.contactId}>
                {formatPersonName(p.firstName, p.lastName)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilter && (
          <Button
            variant='ghost'
            size='sm'
            onClick={resetExpenseFilters}
            className='h-8 px-2 lg:px-3'
          >
            <Trans>Réinitialiser</Trans>
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>

      {expenseGroups.length > 0 ? (
        <div className='space-y-4'>
          {expenseGroups.map((group) => (
            <div key={group.dateKey} className='space-y-2'>
              <p className='text-xs font-semibold text-muted-foreground capitalize'>
                {formatWeekdayDayMonth(group.date, i18n.locale)}
              </p>
              <div className='space-y-2'>
                {group.expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className='flex items-start justify-between gap-3 rounded-md border p-3'
                  >
                    <div className='min-w-0 flex-1 space-y-1'>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type='button'
                            className='line-clamp-2 text-start font-medium break-words hover:text-muted-foreground'
                          >
                            {expense.label}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className='text-sm whitespace-pre-wrap'>
                          {expense.label}
                        </PopoverContent>
                      </Popover>
                      <PayersCell payers={expense.payers} />
                    </div>
                    <div className='flex shrink-0 items-center gap-1'>
                      <span className='font-medium tabular-nums'>
                        {formatEuros(
                          centsToEuros(expense.totalAmount),
                          i18n.locale
                        )}
                      </span>
                      {!isSold && (
                        <>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-muted-foreground hover:text-foreground'
                            onClick={() => onEditExpense(expense)}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-muted-foreground hover:text-destructive'
                            onClick={() => onDeleteExpense(expense)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='rounded-md border py-12 text-center text-sm text-muted-foreground'>
          {hasActiveFilter ? (
            <Trans>Aucune dépense ne correspond aux filtres.</Trans>
          ) : (
            <Trans>Aucune dépense enregistrée.</Trans>
          )}
        </div>
      )}
    </div>
  )
}
