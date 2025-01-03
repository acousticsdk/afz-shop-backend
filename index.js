import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { corsConfig, handlePreflight } from './config/cors.js';
import { steamRoutes } from './routes/steam.js';
import { paymentRoutes } from './routes/payments.js';
import { requestLogger, errorLogger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
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

// Routes
app.use('/api/steam', steamRoutes);
app.use('/api/payments', paymentRoutes);

// Steam rates endpoint
app.get('/steam/rates', (req, res) => {
    res.json({
        data: {
            currencies: [
                { code: 'KZT', rate: 4.75 },
                { code: 'USD', rate: 0.0091 }
            ]
        }
    });
});

// Error handling
app.use(errorLogger);
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});