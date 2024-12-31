import express from 'express';
import { Order } from '../models/Order.js';
import { generateOrderId } from '../utils/orderIdGenerator.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { steamLogin, amount, finalAmount, currency } = req.body;
    const orderId = generateOrderId();
    
    const order = new Order({
      orderId,
      steamLogin,
      amount,
      finalAmount,
      currency
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export const orderRoutes = router;