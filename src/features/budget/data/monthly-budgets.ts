import { type MonthlyBudget } from './schema'

export const monthlyBudgets: MonthlyBudget[] = [
  {
    id: 'budget-2026-1',
    month: 1,
    year: 2026,
    receivedSalary: 1384.17,
    savingsWithdrawals: [
      { id: 'sav-j1', amount: 650, destination: 'bank' as const, withdrawalDate: new Date('2026-01-03'), createdAt: new Date('2026-01-03') },
    ],
    manualActionEntries: [
      {
        subscriptionId: 'sub-7',
        label: 'Loyer (espèces)',
        plannedAmount: 200,
        payments: [{ id: 'pay-j1', amount: 200, paymentDate: new Date('2026-01-03'), createdAt: new Date('2026-01-03') }],
      },
      {
        subscriptionId: 'sub-8',
        label: 'Virement Revolut (nourriture + imprévus)',
        plannedAmount: 250,
        payments: [{ id: 'pay-j2', amount: 250, paymentDate: new Date('2026-01-03'), createdAt: new Date('2026-01-03') }],
      },
      {
        subscriptionId: 'sub-9',
        label: 'Essence',
        plannedAmount: 90,
        payments: [{ id: 'pay-j3', amount: 90, paymentDate: new Date('2026-01-05'), createdAt: new Date('2026-01-05') }],
      },
    ],
  },
  {
    id: 'budget-2026-2',
    month: 2,
    year: 2026,
    receivedSalary: 1400,
    savingsWithdrawals: [
      { id: 'sav-f1', amount: 400, destination: 'bank' as const, withdrawalDate: new Date('2026-02-06'), createdAt: new Date('2026-02-06') },
      { id: 'sav-f2', amount: 300, destination: 'cash' as const, withdrawalDate: new Date('2026-02-20'), createdAt: new Date('2026-02-20') },
    ],
    manualActionEntries: [
      {
        subscriptionId: 'sub-7',
        label: 'Loyer (espèces)',
        plannedAmount: 200,
        payments: [{ id: 'pay-f1', amount: 200, paymentDate: new Date('2026-02-06'), createdAt: new Date('2026-02-06') }],
      },
      {
        subscriptionId: 'sub-8',
        label: 'Virement Revolut (nourriture + imprévus)',
        plannedAmount: 250,
        payments: [{ id: 'pay-f2', amount: 250, paymentDate: new Date('2026-02-06'), createdAt: new Date('2026-02-06') }],
      },
      {
        subscriptionId: 'sub-9',
        label: 'Essence',
        plannedAmount: 90,
        payments: [{ id: 'pay-f3', amount: 91, paymentDate: new Date('2026-02-10'), createdAt: new Date('2026-02-10') }],
      },
    ],
  },
  {
    id: 'budget-2026-3',
    month: 3,
    year: 2026,
    receivedSalary: 1500,
    savingsWithdrawals: [
      { id: 'sav-m1', amount: 550, destination: 'bank' as const, withdrawalDate: new Date('2026-03-05'), createdAt: new Date('2026-03-05') },
    ],
    manualActionEntries: [
      {
        subscriptionId: 'sub-7',
        label: 'Loyer (espèces)',
        plannedAmount: 200,
        payments: [{ id: 'pay-m1', amount: 200, paymentDate: new Date('2026-03-05'), createdAt: new Date('2026-03-05') }],
      },
      {
        subscriptionId: 'sub-8',
        label: 'Virement Revolut (nourriture + imprévus)',
        plannedAmount: 250,
        payments: [{ id: 'pay-m2', amount: 250, paymentDate: new Date('2026-03-05'), createdAt: new Date('2026-03-05') }],
      },
      {
        subscriptionId: 'sub-9',
        label: 'Essence',
        plannedAmount: 90,
        payments: [{ id: 'pay-m3', amount: 90, paymentDate: new Date('2026-03-08'), createdAt: new Date('2026-03-08') }],
      },
    ],
  },
  {
    id: 'budget-2026-4',
    month: 4,
    year: 2026,
    receivedSalary: 1384.17,
    savingsWithdrawals: [],
    manualActionEntries: [
      {
        subscriptionId: 'sub-7',
        label: 'Loyer (espèces)',
        plannedAmount: 200,
        payments: [{ id: 'pay-a1', amount: 90, paymentDate: new Date('2026-04-05'), createdAt: new Date('2026-04-05') }],
      },
      {
        subscriptionId: 'sub-8',
        label: 'Virement Revolut (nourriture + imprévus)',
        plannedAmount: 250,
        payments: [],
      },
      {
        subscriptionId: 'sub-9',
        label: 'Essence',
        plannedAmount: 90,
        payments: [{ id: 'pay-a2', amount: 90, paymentDate: new Date('2026-04-03'), createdAt: new Date('2026-04-03') }],
      },
    ],
  },
]

export function findMonthlyBudget(year: number, month: number) {
  return monthlyBudgets.find((b) => b.year === year && b.month === month) ?? null
}

export function addMonthlyBudget(budget: MonthlyBudget) {
  monthlyBudgets.push(budget)
}

export function removeMonthlyBudget(id: string) {
  const idx = monthlyBudgets.findIndex((b) => b.id === id)
  if (idx !== -1) monthlyBudgets.splice(idx, 1)
}

export function getNextAvailableMonth(budgets: MonthlyBudget[]): { month: number; year: number } {
  if (budgets.length === 0) {
    const now = new Date()
    return { month: now.getMonth() + 1, year: now.getFullYear() }
  }
  const sorted = [...budgets].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  )
  const last = sorted[sorted.length - 1]
  if (last.month === 12) return { month: 1, year: last.year + 1 }
  return { month: last.month + 1, year: last.year }
}
