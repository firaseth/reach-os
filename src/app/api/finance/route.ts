import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const currentUser = await getCurrentUser(new Request('http://localhost'))
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [incomes, expenses] = await Promise.all([
      db.income.findMany({ where: { userId: currentUser.userId }, orderBy: { date: 'asc' } }),
      db.expense.findMany({ where: { userId: currentUser.userId }, orderBy: { date: 'asc' } }),
    ])
    return NextResponse.json({ incomes, expenses })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
