import { Router } from 'express';

const router = Router();

const mockCollections = [
  'EOS-04_SAR-MRS_L2A',
  'RESOURCESAT-2_LISS-III_L1',
  'CARTOSAT-2F_PAN_L1',
  'OCEANSAT-3_OCM_L2',
];

router.get('/collections', (req, res) => {
  try {
    res.status(200).json({ collections: mockCollections });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/search', (req, res) => {
  try {
    const { collections, datetime, filter, filter_lang, intersects } = req.body;
    // Return a mock FeatureCollection
    const features = [
      {
        type: 'Feature',
        id: 'mock-feature-1',
        collection: collections?.[0] || mockCollections[0],
        geometry: intersects || { type: 'Point', coordinates: [0, 0] },
        properties: {
          datetime: datetime || new Date().toISOString(),
          mock: true,
        },
      },
    ];
    res.status(200).json({
      type: 'FeatureCollection',
      features,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
