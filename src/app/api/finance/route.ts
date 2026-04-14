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

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    if (body.type === 'income') {
      const entry = await db.income.create({
        data: {
          source: body.source,
          category: body.category || 'Project',
          amount: body.amount,
          date: body.date,
          recurring: body.recurring || false,
          notes: body.notes || '',
          userId: currentUser.userId,
        },
      })
      return NextResponse.json({ ...entry, type: 'income' })
    } else {
      const entry = await db.expense.create({
        data: {
          vendor: body.vendor,
          category: body.category || 'Software',
          amount: body.amount,
          date: body.date,
          recurring: body.recurring || false,
          notes: body.notes || '',
          userId: currentUser.userId,
        },
      })
      return NextResponse.json({ ...entry, type: 'expense' })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, type, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    if (type === 'income') {
      const entry = await db.income.update({ where: { id, userId: currentUser.userId }, data })
      return NextResponse.json({ ...entry, type: 'income' })
    } else {
      const entry = await db.expense.update({ where: { id, userId: currentUser.userId }, data })
      return NextResponse.json({ ...entry, type: 'expense' })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, type } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    if (type === 'income') {
      await db.income.delete({ where: { id, userId: currentUser.userId } })
    } else {
      await db.expense.delete({ where: { id, userId: currentUser.userId } })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
