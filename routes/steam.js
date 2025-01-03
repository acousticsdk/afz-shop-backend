import express from 'express';
import { steamService } from '../services/steamService.js';

const router = express.Router();

// Steam account validation
router.post('/account/check', async (req, res, next) => {
    try {
        const { steam_account } = req.body;
        if (!steam_account) {
            return res.status(400).json({ error: 'steam_account is required' });
        }

        const result = await steamService.checkAccount(steam_account);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Create Steam topup
router.post('/topup/create', async (req, res, next) => {
    try {
        const { 
            steam_account, 
            amount, 
            topup_amount, 
            currency = 'RUB', 
            order_id, 
            description, 
            customer 
        } = req.body;

        // Validate required fields
        if (!steam_account || !amount || !topup_amount || !order_id) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['steam_account', 'amount', 'topup_amount', 'order_id']
            });
        }

        const result = await steamService.createTopup({
            steam_account,
            amount,
            topup_amount,
            currency,
            order_id,
            description,
            customer
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get currency rates
router.get('/rates', async (req, res, next) => {
    try {
        const rates = await steamService.getRates();
        res.json(rates);
    } catch (error) {
        next(error);
    }
});

export { router as steamRouter };