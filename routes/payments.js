import express from 'express';
import { AntilopayService } from '../services/antilopayService.js';

const router = express.Router();
const antilopayService = new AntilopayService();

router.post('/create', async (req, res) => {
    try {
        const { steamLogin, amount, finalAmount } = req.body;
        
        const paymentData = {
            merchant: process.env.ANTILOPAY_MERCHANT_ID,
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
