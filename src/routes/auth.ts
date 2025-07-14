import { Router } from 'express';
import {
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
  validateAccessToken,
  storeBhoonidhiToken,
  removeBhoonidhiToken,
  getTokenExpiryMs,
} from '../utils/tokenManager';
import { BhoonidhiApiClient } from '../utils/BhoonidhiApiClient';

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
          const userObj = loginResponse.Results[0];
          const bhoonidhiToken = userObj.JWT;

          storeBhoonidhiToken(userId, bhoonidhiToken);
          const tokenExpiry = await getTokenExpiryMs(bhoonidhiToken);

          // Generate our own access and refresh tokens for session management
          const accessToken = generateAccessToken(userId);
          const refreshToken = generateRefreshToken(userId);
          refreshTokens.add(refreshToken);

          return res.status(200).json({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: tokenExpiry,
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
      const userId = validateRefreshToken(refresh_token);
      if (!userId) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
      const accessToken = generateAccessToken(userId);
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
    const userId = validateAccessToken(token);
    if (userId) {
      removeBhoonidhiToken(userId);
    }

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
