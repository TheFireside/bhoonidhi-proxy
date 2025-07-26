import { Router } from 'express';
import { BhoonidhiApiServices } from '../services/bhoonidhiApiService';
import { AuthenticatedRequest, requireAuth } from '../utils/authMiddleware';

const router = Router();
const bhoonidhiService = BhoonidhiApiServices.getInstance();

function buildSearchBodyFromRequest(req: AuthenticatedRequest) {
  const { collections, datetime, filter } = req.body;
  const [sdate, edate] = (datetime || '').split('/');
  return {
    userId: req.bhoonidhiPayload?.USERID || '',
    prod: req.body.prod || 'Standard',
    selSats: Array.isArray(collections) ? collections.map(encodeURIComponent).join('%2C') : '',
    offset: req.body.offset || '0',
    sdate: sdate ? encodeURIComponent(sdate) : '',
    edate: edate ? encodeURIComponent(edate) : '',
    query: req.body.query || '',
    queryType: req.body.queryType || '',
    isMX: req.body.isMX || 'No',
    loc: req.body.loc || '',
    lat: req.body.lat || '',
    lon: req.body.lon || '',
    radius: req.body.radius || '',
    filters: filter ? encodeURIComponent(JSON.stringify(filter)) : encodeURIComponent('{}'),
  };
}

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const bhoonidhiToken = req.bhoonidhiPayload?.JWT;
    if (!bhoonidhiToken) {
      return res.status(401).json({ error: 'Bhoonidhi token not found' });
    }
    const searchBody = buildSearchBodyFromRequest(req);
    const searchResults = await bhoonidhiService.searchProducts(searchBody, bhoonidhiToken);
    res.status(200).json(searchResults);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
