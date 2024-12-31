import express from 'express';
import cors from 'cors';
import { paymentRoutes } from './routes/payments.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
