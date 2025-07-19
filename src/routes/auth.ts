import { Router } from 'express';
import { tokenManager } from '../utils/tokenManager';
import { BhoonidhiApiClient } from '../utils/BhoonidhiApiClient';
import { BhoonidhiLoginResponse } from '../utils/types/bhoonidhiApiClient.types';

const router = Router();

const refreshTokens = new Set<string>();

const bhoonidhiClient = new BhoonidhiApiClient();

router.post('/token', async (req, res) => {
  const { userId, password, grant_type, refresh_token } = req.body;

  try {
    if (grant_type === 'password') {
      if (!userId || !password) {
        return res.status(400).json({ error: 'Missing userId or password' });
      }

      try {
        const loginResponse = await bhoonidhiClient.getAccessToken({
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

          tokenManager.storeBhoonidhiPayload(dataObj.USERID, dataObj);
          const tokenExpiry = await tokenManager.getTokenExpiryMs(dataObj.JWT);

          const sessionId = Math.floor(Math.random() * 1000000); // Simple random session ID
          const ipAddress = req.ip || req.connection?.remoteAddress || '';
          let expiresAt;
          if (typeof tokenExpiry === 'number') {
            expiresAt = new Date(Date.now() + tokenExpiry);
          } else {
            expiresAt = new Date(Date.now() + 60 * 60 * 1000); // fallback 1 hour
          }
          const pad = (n: number) => n.toString().padStart(2, '0');
          const expiresAtTime = `${expiresAt.getFullYear()}-${pad(expiresAt.getMonth() + 1)}-${pad(expiresAt.getDate())} ${pad(expiresAt.getHours())}:${pad(expiresAt.getMinutes())}:${pad(expiresAt.getSeconds())}`;

          const tokenPayload = {
            sub: 'Auth',
            UserID: dataObj.USERID,
            IPAddress: ipAddress,
            SessionID: sessionId,
            expiresAtTime,
          };

          const accessToken = tokenManager.generateAccessToken(tokenPayload);
          const refreshToken = tokenManager.generateRefreshToken(tokenPayload);
          refreshTokens.add(refreshToken);

          return res.status(200).json({
            userId: dataObj.USERID,
            access_token: accessToken,
            token_type: "Bearer",
            expires_in: typeof tokenExpiry === "number" ? Math.floor(tokenExpiry / 1000) : 1200,
            refresh_token: refreshToken,
          });
        } else {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      } catch (loginError) {
        console.error('Bhoonidhi login error:', loginError);
        return res.status(401).json({ error: 'Authentication failed' });
      }
    } else if (grant_type === 'refresh_token') {
      if (!refresh_token || !refreshTokens.has(refresh_token)) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
      // Simulate refresh
      const userId = tokenManager.validateRefreshToken(refresh_token);
      if (!userId) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
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
      const accessToken = tokenManager.generateAccessToken(tokenPayload);
      return res.status(200).json({
        access_token: accessToken,
        refresh_token,
        expires_in: 3600,
      });
    } else {
      return res.status(400).json({ error: 'Invalid grant_type' });
    }
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const bhoonidhiToken = req.headers['x-bhoonidhi-token'] as string;

    // Remove from our refresh tokens
    if (refreshTokens.has(token)) {
      refreshTokens.delete(token);
    }

    // Logout from Bhoonidhi API if token is provided
    if (bhoonidhiToken) {
      try {
        await bhoonidhiClient.logout({ token: bhoonidhiToken });
      } catch (logoutError) {
        console.error('Bhoonidhi logout error:', logoutError);
        // Don't fail the request if Bhoonidhi logout fails
      }
    }

    // Remove Bhoonidhi token from storage
    const userId = tokenManager.validateAccessToken(token);
    if (userId) {
      tokenManager.removeBhoonidhiToken(userId);
    }

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
