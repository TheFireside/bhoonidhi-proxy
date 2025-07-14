import { Router, Request } from 'express';
import { BhoonidhiApiClient } from '../utils/BhoonidhiApiClient';

const router = Router();

interface BhoonidhiRequest extends Request {
  userId?: string;
  bhoonidhiToken?: string;
  userEmail?: string;
}

// Create Bhoonidhi API client instance
const bhoonidhiClient = new BhoonidhiApiClient();

router.get('/', async (req: BhoonidhiRequest, res) => {
  try {
    const { id, collection } = req.query;
    const bhoonidhiToken = req.bhoonidhiToken;

    if (!bhoonidhiToken) {
      return res.status(401).json({ error: 'Bhoonidhi token not found' });
    }

    if (!id || !collection) {
      return res.status(400).json({ error: 'Missing id or collection parameter' });
    }

    // Use Bhoonidhi API for download functionality
    // Note: The actual download endpoint might be different based on Bhoonidhi API
    // This is a placeholder implementation
    const downloadBody = {
      action: 'DOWNLOAD',
      productId: id as string,
      collection: collection as string,
    };

    try {
      const downloadResponse = await bhoonidhiClient.searchProducts(downloadBody, bhoonidhiToken);

      return res.status(200).json({
        download_url:
          downloadResponse.downloadUrl ||
          `https://bhoonidhi.nrsc.gov.in/download/${collection}/${id}`,
        download_info: downloadResponse,
      });
    } catch (downloadError) {
      console.error('Download error:', downloadError);
      // Fallback to a generic download URL
      return res.status(200).json({
        download_url: `https://bhoonidhi.nrsc.gov.in/download/${collection}/${id}`,
        note: 'Using fallback download URL',
      });
    }
  } catch (err) {
    console.error('Download route error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
