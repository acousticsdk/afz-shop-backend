import express from 'express';
import { SteamService } from '../services/steamService.js';
import logger from '../config/logger.js';
import { validateAmount } from '../utils/validators.js';

const router = express.Router();
const steamService = new SteamService({
    baseUrl: process.env.API_BASE_URL,
    merchantId: process.env.MERCHANT_ID,
    secretKey: process.env.SECRET_KEY
});

// Validate Steam account
router.post('/account/check', async (req, res) => {
    try {
        const { login } = req.body;
        
        if (!login) {
            return res.status(400).json({
                error: 'Missing Steam login'
            });
        }

        const validation = await steamService.validateSteamAccount(login);
        
        if (!validation.isValid) {
            return res.status(400).json({
                error: validation.error || 'Invalid Steam account'
            });
        }

        res.json({ 
            can_topup: true 
        });
    } catch (error) {
        logger.error('Steam account validation error:', error);
        res.status(500).json({
            error: 'Failed to validate Steam account'
        });
    }
});

// Create Steam topup
router.post('/topup/create', async (req, res) => {
    try {
        const { login, amount, currency = 'RUB' } = req.body;

        // Validate required fields
        if (!login || !amount) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Validate amount
        const amountValidation = validateAmount(amount);
        if (!amountValidation.isValid) {
            return res.status(400).json({
                error: 'Invalid amount',
                message: amountValidation.error
            });
        }

        // Create topup payment
        const paymentUrl = await steamService.createTopup({
            login,
            amount: amountValidation.value,
            currency,
            orderId: `ORDER${Date.now()}`,
            successUrl: `${process.env.FRONTEND_URL}/success`,
            failUrl: `${process.env.FRONTEND_URL}/fail`
        });

        res.json({ payment_url: paymentUrl });
    } catch (error) {
        logger.error('Steam topup creation error:', error);
        res.status(500).json({
            error: 'Failed to create Steam topup',
            message: error.message
        });
    }
});

export const steamRoutes = router;