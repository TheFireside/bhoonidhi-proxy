import { Response, NextFunction, Request } from 'express';
import { tokenManager } from '../utils/tokenManager';
import { BhoonidhiLoginResponse } from '../types/bhoonidhi/bhoonidhiApiClient.types';

export interface AuthenticatedRequest extends Request {
  bhoonidhiPayload?: BhoonidhiLoginResponse;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.replace('Bearer ', '');
  const userId = tokenManager.validateAccessToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
  const bhoonidhiPayload = await tokenManager.getBhoonidhiPayload(userId);
  req.bhoonidhiPayload = bhoonidhiPayload;

  next();
}
