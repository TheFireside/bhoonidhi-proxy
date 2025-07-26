import { Request, Response } from 'express';
import { BhoonidhiApiServices } from '../services/bhoonidhiApiService';
import { BhoonidhiLoginResponse } from '../types/bhoonidhi/bhoonidhiApiClient.types';
import jwt from 'jsonwebtoken';
import { tokenManager, TokenManager } from '../utils/tokenManager';

class AuthController {
  constructor(
    private bhoonidhiApiService: BhoonidhiApiServices,
    private tokenManager: TokenManager,
  ) {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login(req: Request, res: Response): Promise<void> {
    const { userId, password, grant_type, refresh_token } = req.body;

    try {
      if (grant_type === 'password') {
        if (!userId || !password) {
          res.status(400).json({ error: 'Missing userId or password' });
        }

        try {
          const loginResponse = await this.bhoonidhiApiService.getAccessToken({
            userId,
            password,
          });

          if (
            loginResponse &&
            Array.isArray(loginResponse.Results) &&
            loginResponse.Results.length > 0 &&
            loginResponse.Results[0].JWT
          ) {
            const dataObj = loginResponse.Results[0] as BhoonidhiLoginResponse;
            const bhoonidhiTokenPayload = jwt.decode(dataObj.JWT);

            if (!bhoonidhiTokenPayload || typeof bhoonidhiTokenPayload !== 'object') {
              res.status(401).json({ error: 'Invalid Bhoonidhi token' });
              return;
            }

            const tokenExpiry = bhoonidhiTokenPayload.expiresAtTime;
            const ttlSeconds =
              new Date(tokenExpiry).getTime() / 1000 - Math.floor(Date.now() / 1000);
            await this.tokenManager.storeBhoonidhiPayload(dataObj.USERID, dataObj, ttlSeconds);

            const ipAddress = req.ip || req.connection?.remoteAddress || '';

            const tokenPayload = {
              sub: 'Auth',
              UserID: dataObj.USERID,
              IPAddress: ipAddress,
              SessionID: bhoonidhiTokenPayload.SessionID,
              expiresAtTime: bhoonidhiTokenPayload.expiresAtTime,
            };

            const accessToken = this.tokenManager.generateAccessToken(tokenPayload);
            // const refreshToken = this.tokenManager.generateRefreshToken(tokenPayload);
            // await this.tokenManager.storeRefreshToken(dataObj.USERID, refreshToken, 604800);

            res.status(200).json({
              userId: dataObj.USERID,
              access_token: accessToken,
              token_type: 'Bearer',
              expires_in: ttlSeconds,
              refresh_token: 'not_implemented',
            });
            return;
          } else {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
          }
        } catch (loginError) {
          console.error('Bhoonidhi login error:', loginError);
          res.status(401).json({ error: 'Authentication failed' });
          return;
        }
      } else if (grant_type === 'refresh_token') {
        if (!refresh_token) {
          res.status(401).json({ error: 'Invalid refresh token' });
          return;
        }
        // Find userId by decoding the refresh token
        const userId = this.tokenManager.validateRefreshToken(refresh_token);
        if (!userId) {
          res.status(401).json({ error: 'Invalid refresh token' });
          return;
        }
        // Check if the refresh token matches the one in Redis
        const storedRefreshToken = await this.tokenManager.getRefreshToken(userId);
        if (storedRefreshToken !== refresh_token) {
          res.status(401).json({ error: 'Invalid or expired refresh token' });
          return;
        }
        // Remove the refresh token from Redis (token rotation)
        await this.tokenManager.removeRefreshToken(userId);
        // Reconstruct a minimal payload for refresh
        const ipAddress = req.ip || req.connection?.remoteAddress || '';
        const sessionId = Math.floor(Math.random() * 1000000);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        const pad = (n: number) => n.toString().padStart(2, '0');
        const expiresAtTime = `${expiresAt.getFullYear()}-${pad(expiresAt.getMonth() + 1)}-${pad(expiresAt.getDate())} ${pad(expiresAt.getHours())}:${pad(expiresAt.getMinutes())}:${pad(expiresAt.getSeconds())}`;
        const tokenPayload = {
          sub: 'Auth',
          UserID: userId,
          IPAddress: ipAddress,
          SessionID: sessionId,
          expiresAtTime,
        };
        const accessToken = this.tokenManager.generateAccessToken(tokenPayload);
        res.status(200).json({
          access_token: accessToken,
          refresh_token,
          expires_in: 3600,
        });
        return;
      } else {
        res.status(400).json({ error: 'Invalid grant_type' });
        return;
      }
    } catch (err) {
      console.error('Auth error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      const bhoonidhiToken = req.headers['x-bhoonidhi-token'] as string;

      // Remove from our refresh tokens
      const userId = this.tokenManager.validateAccessToken(token);
      if (userId) {
        await this.tokenManager.removeBhoonidhiToken(userId);
        await this.tokenManager.removeRefreshToken(userId);
      }

      // Logout from Bhoonidhi API if token is provided
      if (bhoonidhiToken) {
        try {
          await this.bhoonidhiApiService.logout({ token: bhoonidhiToken });
        } catch (logoutError) {
          console.error('Bhoonidhi logout error:', logoutError);
        }
      }

      res.status(200).json({ message: 'Logged out successfully' });
      return;
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
  }
}

export const authController = new AuthController(BhoonidhiApiServices.getInstance(), tokenManager);
