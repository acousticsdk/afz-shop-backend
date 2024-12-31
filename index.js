import express from 'express';
import { corsConfig, handlePreflight } from './config/cors.js';
import { paymentRoutes } from './routes/payments.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(corsConfig);
app.use(handlePreflight);

// Middleware
app.use(express.json());

// Routes
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

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
