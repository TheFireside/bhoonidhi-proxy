import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import dataRoutes from './routes/data';
import downloadRoutes from './routes/download';
import { requireAuth } from './utils/authMiddleware';

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/data', requireAuth, dataRoutes);
app.use('/download', requireAuth, downloadRoutes);
app.get('/', (req, res) => {
  const apiDocUrl = process.env.API_DOC_URL || '';
  res.status(200).json({
    status: 'success',
    message:
      'Welcome to the Bhoonidhi Proxy API. Refer to the documentation URL below for all available routes.',
    documentation: { url: apiDocUrl, description: 'Swagger UI for the Bhoonidhi-compatible API' },
    timestamp: new Date().toISOString(),
  });
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
