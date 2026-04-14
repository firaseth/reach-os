import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const currentUser = await getCurrentUser(new Request('http://localhost'))
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rooms = await db.clientRoom.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        deliverables: { orderBy: { createdAt: 'desc' } },
      },
    })
    return NextResponse.json(rooms)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch client rooms' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Handle adding a message to an existing room
    if (body.action === 'message' && body.roomId) {
      const message = await db.message.create({
        data: {
          content: body.content,
          sender: body.sender || 'user',
          type: body.type || 'text',
          roomId: body.roomId,
        },
      })
      return NextResponse.json(message)
    }

    // Handle creating a new room
    const room = await db.clientRoom.create({
      data: {
        name: body.name || 'New Project Room',
        clientName: body.clientName || '',
        clientEmail: body.clientEmail || '',
        description: body.description || '',
        status: body.status || 'active',
        phase: body.phase || 'discovery',
        userId: currentUser.userId,
      },
    })
    return NextResponse.json(room)
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const room = await db.clientRoom.update({ where: { id, userId: currentUser.userId }, data })
    return NextResponse.json(room)
  } catch {
    return NextResponse.json({ error: 'Failed to update client room' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || (await request.json().catch(() => ({}))).id
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.clientRoom.delete({ where: { id, userId: currentUser.userId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete client room' }, { status: 500 })
  }
}
