import jwt, { SignOptions } from 'jsonwebtoken';
import { BhoonidhiLoginResponse } from './types/bhoonidhiApiClient.types';

export interface TokenPayload {
  sub: string;
  UserID: string;
  IPAddress: string;
  SessionID: number;
  expiresAtTime: string;
}

export class TokenManager {
  private accessSecret: string;
  private refreshSecret: string;
  private bhoonidhiTokens: Map<string, BhoonidhiLoginResponse>;

  constructor(accessSecret: string, refreshSecret: string) {
    if (!accessSecret || !refreshSecret) {
      throw new Error('Access and refresh secrets must be provided');
    }
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    this.bhoonidhiTokens = new Map<string, BhoonidhiLoginResponse>();
  }

  generateAccessToken(payload: object, expiresIn?: SignOptions['expiresIn']): string {
    return jwt.sign(payload, this.accessSecret, { expiresIn: expiresIn ?? '1h' });
  }

  generateRefreshToken(payload: object, expiresIn?: SignOptions['expiresIn']): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: expiresIn ?? '7d' });
  }

  validateAccessToken(token: string): string | null {
    try {
      const payload = jwt.verify(token, this.accessSecret) as TokenPayload;
      return payload.UserID;
    } catch {
      return null;
    }
  }

  validateRefreshToken(token: string): string | null {
    try {
      const payload = jwt.verify(token, this.refreshSecret) as TokenPayload;
      return payload.UserID;
    } catch {
      return null;
    }
  }

  // Bhoonidhi token management
  storeBhoonidhiPayload(userId: string, payload: BhoonidhiLoginResponse): void {
    this.bhoonidhiTokens.set(userId, payload);
  }

  getBhoonidhiPayload(userId: string): BhoonidhiLoginResponse | undefined {
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
  process.env.JWT_REFRESH_SECRET || '',
);
