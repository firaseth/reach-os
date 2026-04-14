import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateCSV, csvResponse } from '@/lib/csv'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const format = searchParams.get('format') || 'csv'

    const projects = await db.project.findMany({
      orderBy: { createdAt: 'desc' },
    })

    if (format === 'csv') {
      const headers = [
        'Title',
        'Category',
        'Status',
        'Featured',
        'Hourly Rate',
        'Total Hours',
        'Year',
        'Tags',
      ]
      const csvRows = projects.map((p) => [
        p.title,
        p.category,
        p.status,
        p.featured ? 'Yes' : 'No',
        p.hourlyRate.toFixed(2),
        (p.totalHours || 0).toFixed(1),
        p.year,
        p.tags,
      ])

      return csvResponse(
        generateCSV(headers, csvRows),
        'reach-os-portfolio-report.csv',
      )
    }

    return NextResponse.json({ projects })
  } catch {
    return NextResponse.json(
      { error: 'Failed to export portfolio report' },
      { status: 500 },
    )
  }
}
