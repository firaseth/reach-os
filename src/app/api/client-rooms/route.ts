import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const rooms = await db.clientRoom.findMany({
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
      },
    })
    return NextResponse.json(room)
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
