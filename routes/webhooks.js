import express from 'express';
import { Order } from '../models/Order.js';
import { AntilopayService } from '../services/antilopayService.js';

const router = express.Router();
const antilopayService = new AntilopayService();

router.post('/antilopay', async (req, res) => {
  try {
    const { signature } = req.headers;
    const payload = req.body;

    if (!antilopayService.verifyWebhookSignature(payload, signature)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const order = await Order.findOne({ paymentId: payload.paymentId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = payload.status === 'success' ? 'paid' : 'failed';
    await order.save();

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export const webhookRoutes = router;