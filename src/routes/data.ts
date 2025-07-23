import { Router } from 'express';
import collectionsRoutes from './collections';
import searchRoutes from './search';

const router = Router();

router.use('/collections', collectionsRoutes);

router.use('/', searchRoutes);

export default router;
