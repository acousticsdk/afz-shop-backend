import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { corsConfig, handlePreflight } from './config/cors.js';
import { requestLogger, errorLogger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateSteamLogin } from './utils/validators.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Request logging
app.use(morgan('combined'));
app.use(requestLogger);

// CORS configuration
app.use(corsConfig);
app.use(handlePreflight);

// Body parsing
app.use(express.json());

// Steam rates endpoint
app.get('/steam/rates', (req, res) => {
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
        res.status(500).json({
            error: 'Failed to get currency rates'
        });
    }
});

// Steam account check endpoint
app.post('/steam/account/check', async (req, res) => {
    try {
        const { login } = req.body;
        
        if (!login) {
            return res.status(400).json({
                error: 'Missing Steam login'
            });
        }

        const validation = await validateSteamLogin(login);
        if (!validation.isValid) {
            return res.status(400).json({
                error: validation.error || 'Invalid Steam login'
            });
        }

        res.json({ can_topup: true });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to validate Steam account'
        });
    }
});

// Create Steam topup endpoint
app.post('/steam/topup/create', async (req, res) => {
    try {
        const { login, amount, currency = 'RUB' } = req.body;

        if (!login || !amount) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Simulate payment URL creation
        const paymentUrl = `https://payment.provider.com/pay/${Date.now()}`;
        res.json({ payment_url: paymentUrl });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create payment'
        });
    }
});

// Error handling
app.use(errorLogger);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});