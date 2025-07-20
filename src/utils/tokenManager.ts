import jwt, { SignOptions } from 'jsonwebtoken';
import { BhoonidhiLoginResponse } from './types/bhoonidhiApiClient.types';
import { createClient } from 'redis';

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
  private redisClient;

  constructor(accessSecret: string, refreshSecret: string) {
    if (!accessSecret || !refreshSecret) {
      throw new Error('Access and refresh secrets must be provided');
    }
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    this.redisClient = createClient({
      url: process.env.REDIS_URL || '',
    });
    this.redisClient.connect().catch(console.error);
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
  async storeBhoonidhiPayload(
    userId: string,
    payload: BhoonidhiLoginResponse,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    await this.redisClient.set(`bhoonidhi:token:${userId}`, JSON.stringify(payload), {
      EX: ttlSeconds,
    });
  }

  async getBhoonidhiPayload(userId: string): Promise<BhoonidhiLoginResponse | undefined> {
    const data = await this.redisClient.get(`bhoonidhi:token:${userId}`);
    return data ? (JSON.parse(data) as BhoonidhiLoginResponse) : undefined;
  }

  async removeBhoonidhiToken(userId: string): Promise<void> {
    await this.redisClient.del(`bhoonidhi:token:${userId}`);
  }

  async storeRefreshToken(
    userId: string,
    refreshToken: string,
    ttlSeconds: number = 604800,
  ): Promise<void> {
    await this.redisClient.set(`bhoonidhi:refresh:${userId}`, refreshToken, { EX: ttlSeconds });
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return await this.redisClient.get(`bhoonidhi:refresh:${userId}`);
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.redisClient.del(`bhoonidhi:refresh:${userId}`);
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
