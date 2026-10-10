import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const logs = db.getAuditLogs();
  return NextResponse.json({ success: true, count: logs.length, logs });
}
