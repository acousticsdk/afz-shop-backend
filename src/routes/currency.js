import express from 'express';
import { getCurrencyRates } from '../services/currencyService.js';

const router = express.Router();

router.get('/rates', async (req, res) => {
  try {
    const rates = await getCurrencyRates();
    res.json(rates);
  } catch (error) {
    console.error('Currency rates error:', error);
    res.status(500).json({ error: 'Failed to fetch currency rates' });
  }
});

export default router;