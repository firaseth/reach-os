import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { generateCSV, csvResponse } from '@/lib/csv'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const format = searchParams.get('format') || 'csv'

    const [incomes, expenses] = await Promise.all([
      db.income.findMany({ where: { userId: currentUser.userId }, orderBy: { date: 'asc' } }),
      db.expense.findMany({ where: { userId: currentUser.userId }, orderBy: { date: 'asc' } }),
    ])

    // Group by month (YYYY-MM)
    const monthMap = new Map<
      string,
      { income: number; expenses: number; notes: string[] }
    >()

    for (const income of incomes) {
      const month = income.date.substring(0, 7) // YYYY-MM
      const entry = monthMap.get(month) || { income: 0, expenses: 0, notes: [] }
      entry.income += income.amount
      if (income.notes) entry.notes.push(`Income: ${income.notes}`)
      monthMap.set(month, entry)
    }

    for (const expense of expenses) {
      const month = expense.date.substring(0, 7)
      const entry = monthMap.get(month) || { income: 0, expenses: 0, notes: [] }
      entry.expenses += expense.amount
      if (expense.notes) entry.notes.push(`Expense: ${expense.notes}`)
      monthMap.set(month, entry)
    }

    const months = Array.from(monthMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    )

    let totalIncome = 0
    let totalExpenses = 0
    const categoryIncomeMap = new Map<string, number>()
    const categoryExpenseMap = new Map<string, number>()

    // Income category breakdown
    for (const income of incomes) {
      const cat = income.category || 'Uncategorized'
      categoryIncomeMap.set(cat, (categoryIncomeMap.get(cat) || 0) + income.amount)
      totalIncome += income.amount
    }

    // Expense category breakdown
    for (const expense of expenses) {
      const cat = expense.category || 'Uncategorized'
      categoryExpenseMap.set(cat, (categoryExpenseMap.get(cat) || 0) + expense.amount)
      totalExpenses += expense.amount
    }

    if (format === 'csv') {
      const headers = ['Month', 'Income', 'Expenses', 'Profit', 'Margin', 'Notes']
      const csvRows = months.map(([month, data]) => {
        const profit = data.income - data.expenses
        const margin = data.income > 0 ? ((profit / data.income) * 100).toFixed(1) + '%' : '0%'
        return [
          month,
          data.income.toFixed(2),
          data.expenses.toFixed(2),
          profit.toFixed(2),
          margin,
          data.notes.join('; '),
        ]
      })

      // Add summary row
      const totalProfit = totalIncome - totalExpenses
      const totalMargin =
        totalIncome > 0
          ? ((totalProfit / totalIncome) * 100).toFixed(1) + '%'
          : '0%'
      csvRows.push([
        'TOTAL',
        totalIncome.toFixed(2),
        totalExpenses.toFixed(2),
        totalProfit.toFixed(2),
        totalMargin,
        'Summary',
      ])

      // Category breakdown rows
      csvRows.push([]) // blank line
      csvRows.push(['--- Income Category Breakdown ---', '', '', '', '', ''])
      for (const [cat, amount] of Array.from(categoryIncomeMap.entries()).sort()) {
        csvRows.push([cat, amount.toFixed(2), '', '', '', ''])
      }

      csvRows.push([]) // blank line
      csvRows.push(['--- Expense Category Breakdown ---', '', '', '', '', ''])
      for (const [cat, amount] of Array.from(categoryExpenseMap.entries()).sort()) {
        csvRows.push([cat, '', amount.toFixed(2), '', '', ''])
      }

      return csvResponse(
        generateCSV(headers, csvRows),
        'reach-os-finance-report.csv',
      )
    }

    const monthlyData = months.map(([month, data]) => {
      const profit = data.income - data.expenses
      const margin =
        data.income > 0 ? (profit / data.income) * 100 : 0
      return {
        month,
        income: data.income,
        expenses: data.expenses,
        profit,
        margin: Math.round(margin * 10) / 10,
      }
    })

    const totalProfit = totalIncome - totalExpenses
    const totalMargin =
      totalIncome > 0
        ? Math.round(((totalProfit / totalIncome) * 100) * 10) / 10
        : 0

    return NextResponse.json({
      monthly: monthlyData,
      incomeCategories: Object.fromEntries(categoryIncomeMap),
      expenseCategories: Object.fromEntries(categoryExpenseMap),
      summary: {
        totalIncome,
        totalExpenses,
        totalProfit,
        totalMargin,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to export finance report' },
      { status: 500 },
    )
  }
}
