import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const currentUser = await getCurrentUser(new Request('http://localhost'))
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const caseStudies = await db.caseStudy.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    })
    return NextResponse.json(caseStudies)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch case studies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const caseStudy = await db.caseStudy.create({
      data: {
        title: body.title || 'Untitled Case Study',
        subtitle: body.subtitle || '',
        challenge: body.challenge || '',
        solution: body.solution || '',
        results: body.results || '',
        process: body.process || '[]',
        testimonial: body.testimonial || '',
        testimonialBy: body.testimonialBy || '',
        coverImage: body.coverImage || '',
        status: body.status || 'draft',
        projectId: body.projectId || '',
        userId: currentUser.userId,
      },
    })
    return NextResponse.json(caseStudy)
  } catch {
    return NextResponse.json({ error: 'Failed to create case study' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const caseStudy = await db.caseStudy.update({ where: { id, userId: currentUser.userId }, data })
    return NextResponse.json(caseStudy)
  } catch {
    return NextResponse.json({ error: 'Failed to update case study' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || (await request.json().catch(() => ({}))).id
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.caseStudy.delete({ where: { id, userId: currentUser.userId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 })
  }
}
