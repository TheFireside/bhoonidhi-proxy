import { Response, NextFunction, Request } from 'express';
import { tokenManager } from '../utils/tokenManager';

interface AuthenticatedRequest extends Request {
  userId?: string;
  bhoonidhiToken?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.replace('Bearer ', '');
  const userId = tokenManager.validateAccessToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
  req.userId = userId;
  req.bhoonidhiToken = tokenManager.getBhoonidhiToken(userId);

  next();
}
