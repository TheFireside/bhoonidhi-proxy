import { Router } from 'express';
import { generateAccessToken, generateRefreshToken, validateRefreshToken } from '../utils/tokenManager';

const router = Router();

// In-memory store for refresh tokens
const refreshTokens = new Set<string>();

router.post('/token', (req, res) => {
  const { userId, password, grant_type, refresh_token } = req.body;

  try {
    if (grant_type === 'password') {
      if (!userId || !password) {
        return res.status(400).json({ error: 'Missing userId or password' });
      }
      // Simulate user validation (always succeed for mock)
      const accessToken = generateAccessToken(userId);
      const refreshToken = generateRefreshToken(userId);
      refreshTokens.add(refreshToken);
      return res.status(200).json({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600
      });
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
        expires_in: 3600
      });
    } else {
      return res.status(400).json({ error: 'Invalid grant_type' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/logout', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.replace('Bearer ', '');
    if (refreshTokens.has(token)) {
      refreshTokens.delete(token);
      return res.status(200).json({});
    } else {
      return res.status(400).json({ error: 'Invalid refresh token' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
