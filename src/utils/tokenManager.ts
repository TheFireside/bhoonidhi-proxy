import jwt from 'jsonwebtoken';

const ACCESS_SECRET = 'mock-access-secret';
const REFRESH_SECRET = 'mock-refresh-secret';

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '1h' });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
}

export function validateAccessToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export function validateRefreshToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}
