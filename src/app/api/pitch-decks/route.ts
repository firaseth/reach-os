import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const currentUser = await getCurrentUser(new Request('http://localhost'))
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pitchDecks = await db.pitchDeck.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(pitchDecks)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch pitch decks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const pitchDeck = await db.pitchDeck.create({
      data: {
        title: body.title || 'Untitled Pitch',
        clientName: body.clientName || '',
        subtitle: body.subtitle || '',
        problem: body.problem || '',
        solution: body.solution || '',
        approach: body.approach || '',
        timeline: body.timeline || '',
        investment: body.investment || '',
        deliverables: body.deliverables || '[]',
        coverImage: body.coverImage || '',
        status: body.status || 'draft',
        userId: currentUser.userId,
      },
    })
    return NextResponse.json(pitchDeck)
  } catch {
    return NextResponse.json({ error: 'Failed to create pitch deck' }, { status: 500 })
  }
}
