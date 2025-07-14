import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET || '';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';

// In-memory store for Bhoonidhi tokens (in production, use Redis or database)
const bhoonidhiTokens = new Map<string, string>();

export function generateAccessToken(userId: string): string {
  console.log(process.env.JWT_SECRET)
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

// Bhoonidhi token management
export function storeBhoonidhiToken(userId: string, bhoonidhiToken: string): void {
  bhoonidhiTokens.set(userId, bhoonidhiToken);
}

export function getBhoonidhiToken(userId: string): string | undefined {
  return bhoonidhiTokens.get(userId);
}

export function removeBhoonidhiToken(userId: string): void {
  bhoonidhiTokens.delete(userId);
}

/**
 * Returns the number of milliseconds until the token expires, based on its "exp" claim.
 * If the token is expired, returns 0. If no exp claim, returns undefined.
 * @param token JWT token string
 */
export function getTokenExpiryMs(token: string): number | undefined {
  try {
    const decoded = jwt.decode(token) as { expiresAtTime?: string } | null;
    if (!decoded || typeof decoded.expiresAtTime !== 'string') {
      return undefined;
    }
    const isoString = decoded.expiresAtTime.replace(' ', 'T') + 'Z';
    const expiryDate = new Date(isoString);
    if (isNaN(expiryDate.getTime())) {
      return undefined;
    }
    const now = Date.now();
    const msLeft = expiryDate.getTime() - now;
    return msLeft > 0 ? msLeft : 0;
  } catch {
    return undefined;
  }
}