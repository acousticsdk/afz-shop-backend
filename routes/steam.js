import express from 'express';
import { AntilopayService } from '../services/antilopayService.js';
import logger from '../config/logger.js';

const router = express.Router();
const antilopayService = new AntilopayService();

// Steam account check endpoint
router.post('/account/check', async (req, res) => {
    try {
        const { login } = req.body;
        
        if (!login) {
            return res.status(400).json({
                error: 'Missing Steam login'
            });
        }

        const validation = await antilopayService.validateSteamAccount(login);
        
        if (!validation.isValid) {
            return res.status(400).json({
                error: validation.error
            });
        }

        res.json({ can_topup: true });
    } catch (error) {
        logger.error('Steam account validation error:', error);
        res.status(500).json({
            error: 'Failed to validate Steam account'
        });
    }
});

// Get Steam rates endpoint
router.get('/rates', (req, res) => {
    try {
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

export const steamRoutes = router;