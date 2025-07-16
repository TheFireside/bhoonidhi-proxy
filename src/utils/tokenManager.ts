import jwt, { SignOptions } from 'jsonwebtoken';

export class TokenManager {
  private accessSecret: string;
  private refreshSecret: string;
  private bhoonidhiTokens: Map<string, string>;

  constructor(accessSecret: string, refreshSecret: string) {
    if (!accessSecret || !refreshSecret) {
      throw new Error('Access and refresh secrets must be provided');
    }
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    this.bhoonidhiTokens = new Map<string, string>();
  }

  generateAccessToken(userId: string, expiresIn?: SignOptions['expiresIn']): string {
    return jwt.sign({ userId }, this.accessSecret, { expiresIn: expiresIn ?? '1h' });
  }

  generateRefreshToken(userId: string, expiresIn?: SignOptions['expiresIn']): string {
    return jwt.sign({ userId }, this.refreshSecret, { expiresIn: expiresIn ?? '7d' });
  }

  validateAccessToken(token: string): string | null {
    try {
      const payload = jwt.verify(token, this.accessSecret) as { userId: string };
      return payload.userId;
    } catch {
      return null;
    }
  }

  validateRefreshToken(token: string): string | null {
    try {
      const payload = jwt.verify(token, this.refreshSecret) as { userId: string };
      return payload.userId;
    } catch {
      return null;
    }
  }

  // Bhoonidhi token management
  storeBhoonidhiToken(userId: string, bhoonidhiToken: string): void {
    this.bhoonidhiTokens.set(userId, bhoonidhiToken);
  }

  getBhoonidhiToken(userId: string): string | undefined {
    return this.bhoonidhiTokens.get(userId);
  }

  removeBhoonidhiToken(userId: string): void {
    this.bhoonidhiTokens.delete(userId);
  }

  /**
   * Returns the number of milliseconds until the token expires, based on its "exp" claim.
   * If the token is expired, returns 0. If no exp claim, returns undefined.
   * @param token JWT token string
   */
  getTokenExpiryMs(token: string): number | undefined {
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
}

export const tokenManager = new TokenManager(
  process.env.JWT_SECRET || '',
  process.env.JWT_REFRESH_SECRET || ''
);
