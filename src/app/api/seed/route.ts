import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const store = db.getStore();
  return NextResponse.json({
    success: true,
    counts: {
      users: store.users.length,
      reports: store.reports.length,
      incidents: store.incidents.length,
      assets: store.assets.length,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const store = db.resetToDemo();
    return NextResponse.json({
      success: true,
      message: 'Bharat Sentinel AI demo database re-seeded successfully.',
      counts: {
        users: store.users.length,
        reports: store.reports.length,
        incidents: store.incidents.length,
        assets: store.assets.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
