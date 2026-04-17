import { getRouteApi, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { type MonthlyBudget } from './data/schema'
import { findMonthlyBudget } from './data/monthly-budgets'
import { useBudgetState } from './hooks/use-budget-state'
import { BudgetDialogs } from './components/budget-dialogs'
import { BudgetManualActionsCard } from './components/budget-manual-actions-card'
import { BudgetMonthNavigator } from './components/budget-month-navigator'
import { BudgetOverviewCards } from './components/budget-overview-cards'
import { BudgetProvider, useBudget } from './components/budget-provider'
import { BudgetSavingsCard } from './components/budget-savings-card'

const route = getRouteApi('/_authenticated/budget/detail')

type BudgetMonthContentProps = {
  budget: MonthlyBudget
  month: number
  year: number
}

function BudgetMonthContent({ budget, month, year }: BudgetMonthContentProps) {
  const { setOpen } = useBudget()
  const {
    activeAutomaticSubscriptions,
    paymentsByAction,
    addPayment,
    savingsWithdrawals,
    addSavingsWithdrawal,
    totalAutomaticDeductions,
    availableAfterDeductions,
    availableForSavings,
    totalSaved,
    remainingToSave,
  } = useBudgetState(budget)

  return (
    <div className='flex flex-col gap-6'>
      <BudgetOverviewCards
        receivedSalary={budget.receivedSalary}
        activeAutomaticSubscriptions={activeAutomaticSubscriptions}
        totalAutomaticDeductions={totalAutomaticDeductions}
        availableAfterDeductions={availableAfterDeductions}
        onEditSalaryClick={() => setOpen('editSalary')}
      />
      <BudgetManualActionsCard
        entries={budget.manualActionEntries}
        paymentsByAction={paymentsByAction}
        month={month}
        year={year}
        onAddPayment={(subscriptionId, payment) => addPayment(subscriptionId, payment)}
      />
      <BudgetSavingsCard
        availableForSavings={availableForSavings}
        totalSaved={totalSaved}
        remainingToSave={remainingToSave}
        savingsWithdrawals={savingsWithdrawals}
        month={month}
        year={year}
        onAddWithdrawal={addSavingsWithdrawal}
      />
    </div>
  )
}

function BudgetContent() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { setOpen } = useBudget()

  const year = search.year ?? new Date().getFullYear()
  const month = search.month ?? (new Date().getMonth() + 1)
  const budget = findMonthlyBudget(year, month)

  return (
    <>
      <Header fixed>
        <div className='flex items-center gap-3'>
          <Button asChild variant='ghost' size='icon'>
            <Link to='/budget'>
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <Separator orientation='vertical' className='h-5' />
        </div>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6 sm:gap-8'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <BudgetMonthNavigator year={year} month={month} navigate={navigate} />
          {!budget && (
            <Button onClick={() => setOpen('initMonth')}>Initialiser ce mois</Button>
          )}
        </div>

        {budget ? (
          <BudgetMonthContent key={budget.id} budget={budget} month={month} year={year} />
        ) : (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground'>
            <p className='text-lg font-medium'>Mois non initialisé</p>
            <p className='text-sm'>Cliquez sur "Initialiser ce mois" pour commencer.</p>
          </div>
        )}
      </Main>

      <BudgetDialogs
        year={year}
        month={month}
        currentSalary={budget?.receivedSalary ?? 0}
      />
    </>
  )
}

export function Budget() {
  return (
    <BudgetProvider>
      <BudgetContent />
    </BudgetProvider>
  )
}
