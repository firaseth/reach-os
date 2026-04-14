export interface ShareLink {
  token: string
  type: 'revenue' | 'finance' | 'capacity' | 'portfolio'
  createdAt: Date
  expiresAt: Date
  data: unknown
}

const shareLinks = new Map<string, ShareLink>()

export function createShareLink(
  type: ShareLink['type'],
  expiresIn: '24h' | '7d' | '30d',
  data: unknown,
): { shareUrl: string; token: string; expiresAt: string } {
  const token = crypto.randomUUID().replace(/-/g, '').substring(0, 16)
  const now = new Date()
  const ms =
    expiresIn === '24h'
      ? 24 * 60 * 60 * 1000
      : expiresIn === '7d'
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000
  const expiresAt = new Date(now.getTime() + ms)

  shareLinks.set(token, {
    token,
    type,
    createdAt: now,
    expiresAt,
    data,
  })

  return {
    shareUrl: `/share/${token}`,
    token,
    expiresAt: expiresAt.toISOString(),
  }
}

export function getShareLink(token: string): ShareLink | undefined {
  const link = shareLinks.get(token)
  if (!link) return undefined
  if (new Date() > link.expiresAt) {
    shareLinks.delete(token)
    return undefined
  }
  return link
}
