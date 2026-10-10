import jwt from 'jsonwebtoken';
import { User, UserRole } from '@/types';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'bharat_sentinel_ai_super_secret_jwt_key_2026';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  badgeId?: string;
  avatarUrl?: string;
}

export function createToken(user: User): string {
  const payload: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    badgeId: user.badgeId,
    avatarUrl: user.avatarUrl,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch (err) {
    return null;
  }
}

export function getSessionFromHeader(authHeader?: string | null): SessionUser | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function authenticateRole(session: SessionUser | null, allowedRoles: UserRole[]): boolean {
  if (!session) return false;
  return allowedRoles.includes(session.role);
}
