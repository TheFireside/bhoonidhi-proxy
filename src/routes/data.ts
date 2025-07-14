import { Router } from 'express';
import { BhoonidhiApiClient } from '../utils/BhoonidhiApiClient';

const router = Router();

// Create Bhoonidhi API client instance
const bhoonidhiClient = new BhoonidhiApiClient();

router.get('/collections', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const bhoonidhiToken = (req as any).bhoonidhiToken;
    
    if (!bhoonidhiToken) {
      return res.status(401).json({ error: 'Bhoonidhi token not found' });
    }

    // Get user email from request or use a default
    const userEmail = (req as any).userEmail || `${userId}@example.com`;
    
    const collections = await bhoonidhiClient.getAllCollectionNames({
      userId,
      userEmail,
      token: bhoonidhiToken,
    });

    res.status(200).json({ collections });
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { collections, datetime, filter, filter_lang, intersects } = req.body;
    const bhoonidhiToken = (req as any).bhoonidhiToken;
    
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
