import { Router } from 'express';
import { BhoonidhiApiClient } from '../utils/BhoonidhiApiClient';
import { AuthenticatedRequest } from '../utils/authMiddleware';

const router = Router();

function minimalHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash).toString(36);
}

const bhoonidhiClient = new BhoonidhiApiClient();

// In-memory cache for the collections hashmap
let collectionsHashMap: Record<string, { id: string; satName: string; dispName: string }> | null = null;

// Helper to build the hashmap from API
async function buildCollectionsHashMap(userId: string, userEmail: string, token: string) {
  const collections = await bhoonidhiClient.getAllCollectionNames({
    userId,
    userEmail,
    token,
  });
  const map: Record<string, { id: string; satName: string; dispName: string }> = {};
  (collections.Results || []).forEach((col) => {
    (col.sensors || []).forEach(sensor => {
      const id = minimalHash(`${col.satName || ''}:${sensor.dispName || ''}`);
      map[id] = {
        id,
        satName: col.satName,
        dispName: sensor.dispName
      };
    });
  });
  return map;
}

// Expose a function to get the hashmap, refreshing if needed
async function getCollectionsHashMap(userId: string, userEmail: string, token: string) {
  if (!collectionsHashMap || Object.keys(collectionsHashMap).length === 0) {
    collectionsHashMap = await buildCollectionsHashMap(userId, userEmail, token);
  }
  return collectionsHashMap;
}

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.bhoonidhiPayload?.USERID || '';
    const bhoonidhiToken = req.bhoonidhiPayload?.JWT || '';
    const userEmail = req.bhoonidhiPayload?.USEREMAIL || '';

    const map = await getCollectionsHashMap(userId, userEmail, bhoonidhiToken);
    // Return as array
    res.status(200).json(Object.values(map));
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router; 