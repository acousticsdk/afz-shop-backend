import express from 'express';
import { AntilopayService } from '../services/antilopayService.js';
import logger from '../config/logger.js';
import { formatAmount } from '../utils/formatters.js';

const router = express.Router();
const antilopayService = new AntilopayService();

router.post('/create', async (req, res) => {
    try {
        const { steamLogin, finalAmount } = req.body;
        const formattedAmount = formatAmount(finalAmount);
        
        logger.info('Payment request received:', {
            steamLogin,
            amount: formattedAmount
        });

        const paymentUrl = await antilopayService.createPayment({
            amount: formattedAmount,
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