import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { paymentRoutes } from './routes/payments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/payments', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});