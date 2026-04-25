import { type MonthlyBudget } from './schema'

export function getNextAvailableMonth(budgets: MonthlyBudget[]): {
  month: number
  year: number
} {
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
