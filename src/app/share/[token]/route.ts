import { NextRequest, NextResponse } from 'next/server'
import { getShareLink } from '@/lib/share-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params
    const link = getShareLink(token)

    if (!link) {
      return NextResponse.json(
        { error: 'Share link not found or expired' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      type: link.type,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt.toISOString(),
      data: link.data,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to retrieve shared data' },
      { status: 500 },
    )
  }
}
