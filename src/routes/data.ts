import { Router } from 'express';
import collectionsRoutes from './collections';
import searchRoutes from './search';

const router = Router();

router.use('/collections', collectionsRoutes);

router.use('/search', searchRoutes);

export default router;
