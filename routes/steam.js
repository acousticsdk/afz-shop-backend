import express from 'express';
import logger from '../config/logger.js';
import { validateAmount } from '../utils/validators.js';

const router = express.Router();

// Get Steam rates
router.get('/rates', (req, res) => {
    try {
        // Return static rates as per documentation
        res.json({
            data: {
                currencies: [
                    { code: 'KZT', rate: 4.75 },
                    { code: 'USD', rate: 0.0091 }
                ]
            }
        });
    } catch (error) {
        logger.error('Steam rates error:', error);
        res.status(500).json({
            error: 'Failed to get Steam rates'
        });
    }
});

// Check Steam account
router.post('/account/check', async (req, res) => {
    try {
        const { login } = req.body;
        
        if (!login) {
            return res.status(400).json({
                error: 'Missing Steam login'
            });
        }

        // Here we would normally validate with Steam's API
        // For now, we'll simulate the validation
        const isValid = login.length >= 3 && /^[a-zA-Z0-9_]+$/.test(login);
        
        if (!isValid) {
            return res.status(400).json({
                error: 'Invalid Steam login format'
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

        // Create payment URL (simulated for now)
        const paymentUrl = `https://payment.provider.com/pay/${Date.now()}`;

        res.json({ payment_url: paymentUrl });
    } catch (error) {
        logger.error('Steam topup creation error:', error);
        res.status(500).json({
            error: 'Failed to create Steam topup'
        });
    }
});

export const steamRoutes = router;