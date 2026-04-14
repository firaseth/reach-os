/** Get initials from a name (e.g., "John Doe" → "JD") */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

/** Format a number as compact currency (e.g., 1500 → "$1.5k") */
export function fmtCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${Math.round(n).toLocaleString()}`
}

/** Safely parse JSON, returning fallback on error */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/** Download data as a file */
export function downloadFile(data: string, filename: string, type: string) {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
