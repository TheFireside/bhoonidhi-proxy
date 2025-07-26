import { Request, Response } from 'express';
import { StacService } from '../services/stacService';
import { AuthenticatedRequest } from '../utils/authMiddleware';

class StacController {
  constructor(private readonly stacService: StacService) {
    this.getLandingPage = this.getLandingPage.bind(this);
    this.getAllCollections = this.getAllCollections.bind(this);
  }

  getLandingPage(req: Request, res: Response): void {
    res.status(200).json(this.stacService.getStacLandingPage());
  }

  getAllCollections(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.bhoonidhiPayload?.USERID || '';
      const bhoonidhiToken = req.bhoonidhiPayload?.JWT || '';
      const userEmail = req.bhoonidhiPayload?.USEREMAIL || '';

      const collections = this.stacService.getAllCollections({
        userId,
        userEmail,
        token: bhoonidhiToken,
      });

      res.status(200).json(collections);
    } catch (err) {
      console.error('Error fetching collections:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const StacControllerInstance = new StacController(StacService.getInstance());
