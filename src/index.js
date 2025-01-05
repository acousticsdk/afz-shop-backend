import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import currencyRoutes from './routes/currency.js';
import steamRoutes from './routes/steam.js';
import orderRoutes from './routes/order.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/currency', currencyRoutes);
app.use('/api/steam', steamRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});