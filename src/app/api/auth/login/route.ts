import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, email } = body;

    let user;
    if (role) {
      user = db.getUserByRole(role);
    } else if (email) {
      user = db.getUserById(email);
    }

    if (!user) {
      // Default to citizen if not found
      user = db.getUserByRole('citizen') || db.getUsers()[0];
    }

    const token = createToken(user);

    db.addAuditLog({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user.id,
      details: `User logged in as ${user.role} (${user.name}).`,
    });

    return NextResponse.json({
      success: true,
      user,
      token,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Login failed' },
      { status: 400 }
    );
  }
}
