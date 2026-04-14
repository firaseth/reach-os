import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const currentUser = await getCurrentUser(new Request('http://localhost'))
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await db.project.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const project = await db.project.create({
      data: {
        title: body.title || 'Untitled Project',
        description: body.description || '',
        category: body.category || 'Branding',
        tags: body.tags || '[]',
        coverImage: body.coverImage || '',
        liveUrl: body.liveUrl || '',
        year: body.year || new Date().getFullYear().toString(),
        status: body.status || 'draft',
        userId: currentUser.userId,
      },
    })
    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
