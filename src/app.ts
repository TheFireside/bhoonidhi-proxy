import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import dataRoutes from './routes/data';
import downloadRoutes from './routes/download';
import { requireAuth } from './utils/authMiddleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/data', requireAuth, dataRoutes);
app.use('/download', requireAuth, downloadRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
