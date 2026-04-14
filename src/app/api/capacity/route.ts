import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const currentUser = await getCurrentUser(new Request('http://localhost'))
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const logs = await db.capacityLog.findMany({ where: { userId: currentUser.userId }, orderBy: { date: 'asc' } })
    return NextResponse.json(logs)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const log = await db.capacityLog.create({
      data: {
        date: body.date,
        hoursWorked: body.hoursWorked,
        hoursAvailable: body.hoursAvailable,
        projectRef: body.projectRef || '',
        notes: body.notes || '',
        userId: currentUser.userId,
      },
    })
    return NextResponse.json(log)
  } catch {
    return NextResponse.json({ error: 'Failed to create capacity log' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const log = await db.capacityLog.update({ where: { id, userId: currentUser.userId }, data })
    return NextResponse.json(log)
  } catch {
    return NextResponse.json({ error: 'Failed to update capacity log' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.capacityLog.delete({ where: { id, userId: currentUser.userId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete capacity log' }, { status: 500 })
  }
}
