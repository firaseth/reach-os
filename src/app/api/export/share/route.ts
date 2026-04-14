import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createShareLink, type ShareLink } from '@/lib/share-store'

type ShareableType = ShareLink['type']

async function fetchDataForType(type: ShareableType, userId: string): Promise<unknown> {
  switch (type) {
    case 'revenue': {
      const [incomes, expenses] = await Promise.all([
        db.income.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
        db.expense.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      ])
      return { incomes, expenses, exportedAt: new Date().toISOString() }
    }
    case 'finance': {
      const [incomes, expenses] = await Promise.all([
        db.income.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
        db.expense.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      ])
      return { incomes, expenses, exportedAt: new Date().toISOString() }
    }
    case 'capacity': {
      const logs = await db.capacityLog.findMany({ where: { userId }, orderBy: { date: 'asc' } })
      return { logs, exportedAt: new Date().toISOString() }
    }
    case 'portfolio': {
      const projects = await db.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      return { projects, exportedAt: new Date().toISOString() }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const type: ShareableType = body.type
    const expiresIn: '24h' | '7d' | '30d' = body.expiresIn || '7d'

    const validTypes: ShareableType[] = ['revenue', 'finance', 'capacity', 'portfolio']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 },
      )
    }

    const validExpiries: Array<'24h' | '7d' | '30d'> = ['24h', '7d', '30d']
    if (!validExpiries.includes(expiresIn)) {
      return NextResponse.json(
        { error: `Invalid expiresIn. Must be one of: ${validExpiries.join(', ')}` },
        { status: 400 },
      )
    }

    const data = await fetchDataForType(type, currentUser.userId)
    const result = createShareLink(type, expiresIn, data)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 },
    )
  }
}
