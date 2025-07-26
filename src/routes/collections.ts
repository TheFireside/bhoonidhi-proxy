import { Router } from 'express';
import { BhoonidhiApiServices } from '../services/bhoonidhiApiService';
import { AuthenticatedRequest } from '../utils/authMiddleware';
import { SearchProductsBody } from '../types/bhoonidhi/bhoonidhiApiClient.types';

const router = Router();

const bhoonidhiService = BhoonidhiApiServices.getInstance();

router.get('/:collectionID', async (req: AuthenticatedRequest, res) => {
  try {
    const collectionID = req.params.collectionID;
    const bhoonidhiToken = req.bhoonidhiPayload?.JWT || '';
    const userId = req.bhoonidhiPayload?.USERID || '';
    const userEmail = req.bhoonidhiPayload?.USEREMAIL || '';
    const response = await bhoonidhiService.getAllCollections({
      userId,
      userEmail,
      token: bhoonidhiToken,
    });
    const collection = bhoonidhiService.getCollectionDetailsFromResponse(response, collectionID);
    res.status(200).json(collection);
  } catch (err) {
    console.error('Error fetching collection details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:collectionID/items', async (req: AuthenticatedRequest, res) => {
  try {
    const collectionID = req.params.collectionID;
    const bhoonidhiToken = req.bhoonidhiPayload?.JWT || '';

    const searchProductsBody: SearchProductsBody = {
      userId: req.bhoonidhiPayload?.USERID || '',
      prod: 'Standard',
      selSats: collectionID,
      offset: '0',
      sdate: 'JUN%2F23%2F2025',
      edate: 'JUL%2F23%2F2025',
      query: 'date',
      queryType: 'date',
      isMX: 'No',
      filters: '%7B%7D',
    };

    const response = await bhoonidhiService.searchProducts(searchProductsBody, bhoonidhiToken);

    res.status(200).json(response.Results);
  } catch (err) {
    console.error('Error fetching collection items:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:collectionID/items/:itemID', async (req: AuthenticatedRequest, res) => {
  try {
    // const collectionID = req.params.collectionID;
    const itemID = req.params.itemID;
    const bhoonidhiToken = req.bhoonidhiPayload?.JWT || '';

    const response = await bhoonidhiService.getProductMeta({
      productID: itemID,
      token: bhoonidhiToken,
      cookie: req.cookies?.bhoonidhiCookie,
    });

    res.status(200).json(response);
  } catch (err) {
    console.error('Error fetching collection item details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
