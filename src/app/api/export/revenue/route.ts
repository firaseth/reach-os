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
    const format = searchParams.get('format') || 'json'

    const [incomes, expenses] = await Promise.all([
      db.income.findMany({ where: { userId: currentUser.userId }, orderBy: { date: 'asc' } }),
      db.expense.findMany({ where: { userId: currentUser.userId }, orderBy: { date: 'asc' } }),
    ])

    // Build unified rows
    const rows: Array<{
      date: string
      type: string
      category: string
      sourceVendor: string
      amount: number
      recurring: boolean
      notes: string
    }> = []

    for (const income of incomes) {
      rows.push({
        date: income.date,
        type: 'Income',
        category: income.category,
        sourceVendor: income.source,
        amount: income.amount,
        recurring: income.recurring,
        notes: income.notes,
      })
    }

    for (const expense of expenses) {
      rows.push({
        date: expense.date,
        type: 'Expense',
        category: expense.category,
        sourceVendor: expense.vendor,
        amount: -expense.amount,
        recurring: expense.recurring,
        notes: expense.notes,
      })
    }

    // Sort by date
    rows.sort((a, b) => a.date.localeCompare(b.date))

    if (format === 'csv') {
      const headers = [
        'Date',
        'Type',
        'Category',
        'Source/Vendor',
        'Amount',
        'Recurring',
        'Notes',
      ]
      const csvRows = rows.map((r) => [
        r.date,
        r.type,
        r.category,
        r.sourceVendor,
        r.amount.toFixed(2),
        r.recurring ? 'Yes' : 'No',
        r.notes,
      ])
      return csvResponse(
        generateCSV(headers, csvRows),
        'reach-os-revenue-report.csv',
      )
    }

    return NextResponse.json({ incomes, expenses })
  } catch {
    return NextResponse.json(
      { error: 'Failed to export revenue report' },
      { status: 500 },
    )
  }
}
