import express from 'express';
import { AntilopayService } from '../services/antilopayService.js';
import { generateOrderId } from '../utils/orderIdGenerator.js';

const router = express.Router();
const antilopayService = new AntilopayService();

router.post('/create', async (req, res) => {
  try {
    const { steamLogin, amount, finalAmount } = req.body;
    const orderId = generateOrderId();
    
    const paymentUrl = await antilopayService.createPayment({
      orderId,
      steamLogin,
      amount,
      finalAmount
    });

    res.json({ paymentUrl });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment',
      message: error.message 
    });
  }
});

export const paymentRoutes = router;