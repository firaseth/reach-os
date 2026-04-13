import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
      },
    })
    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
