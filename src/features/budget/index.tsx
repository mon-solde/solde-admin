import { getRouteApi, Link } from '@tanstack/react-router'
import { Trans } from '@lingui/react/macro'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { useGetMonthlyBudget } from './api/budget-api'
import { BudgetChargesCard } from './components/budget-charges-card'
import { BudgetDialogs } from './components/budget-dialogs'
import { BudgetMonthNavigator } from './components/budget-month-navigator'
import { BudgetOverviewCards } from './components/budget-overview-cards'
import { BudgetProvider, useBudget } from './components/budget-provider'
import { BudgetSavingsCard } from './components/budget-savings-card'
import { type MonthlyBudget } from './data/schema'
import { useBudgetState } from './hooks/use-budget-state'

const route = getRouteApi('/_authenticated/budget/detail')

type BudgetMonthContentProps = {
  budget: MonthlyBudget
  month: number
  year: number
}

function BudgetMonthContent({ budget, month, year }: BudgetMonthContentProps) {
  const { setOpen } = useBudget()
  const {
    recurringCharges,
    addSavingsWithdrawal,
    totalCharges,
    availableAfterDeductions,
    availableForSavings,
    totalSaved,
    remainingToSave,
  } = useBudgetState(budget)

  return (
    <div className='flex flex-col gap-6'>
      <BudgetOverviewCards
        receivedSalary={budget.receivedSalary}
        recurringCharges={recurringCharges}
        totalCharges={totalCharges}
        availableAfterDeductions={availableAfterDeductions}
        onEditSalaryClick={() => setOpen('editSalary')}
      />
      <BudgetChargesCard entries={recurringCharges} />
      <BudgetSavingsCard
        availableForSavings={availableForSavings}
        totalSaved={totalSaved}
        remainingToSave={remainingToSave}
        savingsWithdrawals={budget.savingsWithdrawals}
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
  const month = search.month ?? new Date().getMonth() + 1

  const { data: budget, isLoading } = useGetMonthlyBudget(year, month)

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
          <LanguageSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6 sm:gap-8'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <BudgetMonthNavigator year={year} month={month} navigate={navigate} />
          {!isLoading && !budget && (
            <Button onClick={() => setOpen('initMonth')}>
              <Trans>Initialiser ce mois</Trans>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className='flex flex-col gap-6'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-28 rounded-xl' />
              ))}
            </div>
            <Skeleton className='h-48 rounded-xl' />
            <Skeleton className='h-36 rounded-xl' />
          </div>
        ) : budget ? (
          <BudgetMonthContent
            key={budget.id}
            budget={budget}
            month={month}
            year={year}
          />
        ) : (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground'>
            <p className='text-lg font-medium'>
              <Trans>Mois non initialisé</Trans>
            </p>
            <p className='text-sm'>
              <Trans>
                Cliquez sur "Initialiser ce mois" pour commencer.
              </Trans>
            </p>
          </div>
        )}
      </Main>

      <BudgetDialogs
        year={year}
        month={month}
        budgetId={budget?.id}
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
