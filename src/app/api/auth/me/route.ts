import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const session = getSessionFromHeader(authHeader);

  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user: session });
}
