export function generateCSV(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCSV).join(',')
  const dataLines = rows.map((row) => row.map(escapeCSV).join(','))
  return [headerLine, ...dataLines].join('\n')
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function csvResponse(
  csv: string,
  filename: string,
): Response {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
