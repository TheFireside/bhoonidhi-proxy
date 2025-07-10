import { Request, Response, NextFunction } from 'express';
import { validateAccessToken } from '../utils/tokenManager';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.replace('Bearer ', '');
    const userId = validateAccessToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }
    (req as any).userId = userId;
    next();
}