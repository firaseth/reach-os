import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [incomes, expenses] = await Promise.all([
      db.income.findMany({ orderBy: { date: 'asc' } }),
      db.expense.findMany({ orderBy: { date: 'asc' } }),
    ])
    return NextResponse.json({ incomes, expenses })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
