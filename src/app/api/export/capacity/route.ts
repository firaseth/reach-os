import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { generateCSV, csvResponse } from '@/lib/csv'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const format = searchParams.get('format') || 'csv'

    const logs = await db.capacityLog.findMany({ where: { userId: currentUser.userId }, orderBy: { date: 'asc' } })

    let totalHoursWorked = 0
    let totalHoursAvailable = 0

    for (const log of logs) {
      totalHoursWorked += log.hoursWorked || 0
      totalHoursAvailable += log.hoursAvailable || 0
    }

    const avgUtilization =
      totalHoursAvailable > 0
        ? (totalHoursWorked / totalHoursAvailable) * 100
        : 0

    if (format === 'csv') {
      const headers = [
        'Date',
        'Hours Worked',
        'Hours Available',
        'Utilization %',
        'Notes',
      ]
      const csvRows = logs.map((log) => {
        const utilization =
          log.hoursAvailable > 0
            ? ((log.hoursWorked / log.hoursAvailable) * 100).toFixed(1) + '%'
            : '0%'
        return [
          log.date,
          (log.hoursWorked || 0).toFixed(1),
          (log.hoursAvailable || 0).toFixed(1),
          utilization,
          log.notes || '',
        ]
      })

      // Summary rows
      csvRows.push([]) // blank line
      csvRows.push(['--- Summary ---', '', '', '', ''])
      csvRows.push(['Average Utilization', '', '', `${avgUtilization.toFixed(1)}%`, ''])
      csvRows.push([
        'Total Hours Available',
        '',
        totalHoursAvailable.toFixed(1),
        '',
        '',
      ])
      csvRows.push([
        'Total Hours Worked',
        totalHoursWorked.toFixed(1),
        '',
        '',
        '',
      ])
      csvRows.push([
        'Project Capacity Remaining',
        '',
        (totalHoursAvailable - totalHoursWorked).toFixed(1),
        '',
        '',
      ])

      return csvResponse(
        generateCSV(headers, csvRows),
        'reach-os-capacity-report.csv',
      )
    }

    return NextResponse.json({
      logs,
      summary: {
        totalHoursWorked,
        totalHoursAvailable,
        avgUtilization: Math.round(avgUtilization * 10) / 10,
        remainingCapacity: totalHoursAvailable - totalHoursWorked,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to export capacity report' },
      { status: 500 },
    )
  }
}
