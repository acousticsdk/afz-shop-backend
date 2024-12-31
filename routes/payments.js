import express from 'express';
import { AntilopayService } from '../services/antilopayService.js';
import logger from '../config/logger.js';

const router = express.Router();
const antilopayService = new AntilopayService();

router.post('/create', async (req, res) => {
    try {
        const { steamLogin, amount, finalAmount } = req.body;
        
        logger.info('Payment request received:', {
            steamLogin,
            amount,
            finalAmount
        });

        // Pass finalAmount as the payment amount
        const paymentUrl = await antilopayService.createPayment({
            finalAmount,
            steamLogin,
            successUrl: `${process.env.FRONTEND_URL}/success`,
            failUrl: `${process.env.FRONTEND_URL}/fail`,
            customer: {
                email: 'test@example.com',
                phone: '79001234567'
            }
        });
        
        logger.info('Payment URL created:', { paymentUrl });
        
        res.json({ paymentUrl });
    } catch (error) {
        logger.error('Payment creation error:', {
            error: error.message,
            stack: error.stack
        });
        
        res.status(500).json({ 
            error: 'Failed to create payment',
            message: error.message 
        });
    }
});

export const paymentRoutes = router;