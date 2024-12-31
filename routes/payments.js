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
            finalAmount,
            timestamp: new Date().toISOString()
        });

        const paymentData = {
            amount: finalAmount.toFixed(2),
            currency: 'RUB',
            orderId: Date.now().toString(),
            description: `Пополнение Steam для ${steamLogin}`,
            successUrl: `${process.env.FRONTEND_URL}/success`,
            failUrl: `${process.env.FRONTEND_URL}/fail`,
            customer: {
                email: 'test@example.com',
                phone: '79001234567'
            },
            receipt: {
                items: [{
                    name: 'Пополнение баланса Steam',
                    quantity: 1,
                    price: finalAmount,
                    sum: finalAmount,
                    payment_method: 'full_prepayment',
                    payment_object: 'service'
                }]
            }
        };

        const paymentUrl = await antilopayService.createPayment(paymentData);
        
        logger.info('Payment URL created:', {
            paymentUrl,
            timestamp: new Date().toISOString()
        });
        
        res.json({ paymentUrl });
    } catch (error) {
        logger.error('Payment creation error:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ 
            error: 'Failed to create payment',
            message: error.message 
        });
    }
});

export const paymentRoutes = router;
