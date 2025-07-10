import { Router } from 'express';
import { validateAccessToken } from '../utils/tokenManager';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { id, collection } = req.query;
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.replace('Bearer ', '');
    const userId = validateAccessToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }
    if (!id || !collection) {
      return res.status(400).json({ error: 'Missing id or collection parameter' });
    }
    // Return a mock download link
    return res.status(200).json({
      download_url: `https://mock-download.com/${collection}/${id}`,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
