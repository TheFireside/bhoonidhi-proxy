import { Router } from 'express';
import { BhoonidhiApiClient } from '../utils/BhoonidhiApiClient';
import { AuthenticatedRequest, requireAuth } from '../utils/authMiddleware';
import collectionsRoutes from './collections';

const router = Router();

// Create Bhoonidhi API client instance
const bhoonidhiClient = new BhoonidhiApiClient();

router.use('/collections', collectionsRoutes);

router.post('/search', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { collections, datetime, filter, filter_lang, intersects } = req.body;
    const bhoonidhiToken = req.bhoonidhiPayload?.JWT;

    if (!bhoonidhiToken) {
      return res.status(401).json({ error: 'Bhoonidhi token not found' });
    }

    // Use Bhoonidhi API for product search
    const searchBody = {
      action: 'SEARCH',
      collections: collections || [],
      datetime: datetime || '',
      filter: filter || '',
      filter_lang: filter_lang || 'cql2-json',
      intersects: intersects || null,
    };

    const searchResults = await bhoonidhiClient.searchProducts(searchBody, bhoonidhiToken);

    res.status(200).json(searchResults);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
