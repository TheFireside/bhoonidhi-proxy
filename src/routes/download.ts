import { Router } from 'express';
import { BhoonidhiApiClient } from '../utils/BhoonidhiApiClient';
import { AuthenticatedRequest } from '../utils/authMiddleware';

const router = Router();

// Create Bhoonidhi API client instance
const bhoonidhiClient = new BhoonidhiApiClient();

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    // const { id, collection } = req.query;
    const bhoonidhiToken = req.bhoonidhiPayload?.JWT;

    if (!bhoonidhiToken) {
      return res.status(401).json({ error: 'Bhoonidhi token not found' });
    }

    // if (!id || !collection) {
    //   return res.status(400).json({ error: 'Missing id or collection parameter' });
    // }

    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    const cartDate = today.toLocaleDateString('en-GB', options).replace(/ /g, '%20');
    const cartItems = await bhoonidhiClient.viewCart(
      {
        userId: req.bhoonidhiPayload?.USERID || '',
        cartDate,
      },
      bhoonidhiToken,
      req.cookies?.bhoonidhiCookie,
    );

    const downloadPath = bhoonidhiClient.getDownloadPath({
      sat: cartItems.Results[0].SATELLITE,
      sen: cartItems.Results[0].SENSOR,
      imgPath: cartItems.Results[0].DIRPATH,
      prdId: cartItems.Results[0].PRODUCTID,
      sid: cartItems.Results[0].srt,
      token: bhoonidhiToken,
    });

    return res.status(200).json(downloadPath);
  } catch (err) {
    console.error('Download route error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
