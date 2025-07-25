import { Router } from 'express';
import { BhoonidhiApiClient } from '../utils/BhoonidhiApiClient';
import { AuthenticatedRequest } from '../utils/authMiddleware';

const router = Router();

// Create Bhoonidhi API client instance
const bhoonidhiClient = new BhoonidhiApiClient();

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { id, collection } = req.query;
    const bhoonidhiToken = req.bhoonidhiPayload?.JWT;

    if (!bhoonidhiToken) {
      return res.status(401).json({ error: 'Bhoonidhi token not found' });
    }

    if (!id || !collection) {
      return res.status(400).json({ error: 'Missing id or collection parameter' });
    }

    const productMeta = await bhoonidhiClient.getProductMeta({
      productID: id as string,
      token: bhoonidhiToken,
      cookie: req.cookies?.bhoonidhiCookie,
    });

    if (Object.keys(productMeta).length === 0) {
      throw new Error('Product metadata not found');
    }

    const downloadPath = bhoonidhiClient.getDownloadPath({
      sat: productMeta.SATELLITE,
      sen: productMeta.SENSOR,
      imgPath: productMeta.DIRPATH,
      prdId: productMeta.OTSPRODUCTID,
      token: bhoonidhiToken,
    });

    return res.redirect(downloadPath);
  } catch (err) {
    console.error('Download route error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
