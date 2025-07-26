import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

router.post('/token', authController.login);

router.post('/logout', authController.logout);

export default router;
