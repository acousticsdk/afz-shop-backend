import express from 'express';
import { body, validationResult } from 'express-validator';
import { createOrder } from '../services/orderService.js';

const router = express.Router();

router.post('/create',
  [
    body('steamAccount').trim().notEmpty(),
    body('amount').isFloat({ min: 0 }),
    body('topupAmount').isFloat({ min: 0 }),
    body('orderId').trim().notEmpty(),
    body('customerEmail').isEmail(),
    body('successUrl').isURL(),
    body('failUrl').isURL()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const orderData = req.body;
      const result = await createOrder(orderData);
      res.json(result);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

export default router;