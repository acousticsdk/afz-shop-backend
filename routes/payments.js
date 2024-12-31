import express from 'express';
import { AntilopayService } from '../services/antilopayService.js';
import logger from '../config/logger.js';

const router = express.Router();
const antilopayService = new AntilopayService();

router.post('/create', async (req, res) => {
    try {
        const { steamLogin, finalAmount } = req.body;
        
        logger.info('Payment request received:', {
            steamLogin,
            amount: finalAmount
        });

        const paymentUrl = await antilopayService.createPayment({
            amount: Number(finalAmount), // Ensure amount is a number
            steamLogin,
            successUrl: `${process.env.FRONTEND_URL}/success`,
            failUrl: `${process.env.FRONTEND_URL}/fail`
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