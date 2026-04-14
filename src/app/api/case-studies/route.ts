import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const caseStudies = await db.caseStudy.findMany({
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
      },
    })
    return NextResponse.json(caseStudy)
  } catch {
    return NextResponse.json({ error: 'Failed to create case study' }, { status: 500 })
  }
}
