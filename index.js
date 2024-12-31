import express from 'express';
import cors from 'cors';
import { paymentRoutes } from './routes/payments.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS to allow requests from the frontend
app.use(cors({
    origin: ['https://sparkling-caramel-9bec53.netlify.app', 'http://localhost:3000'],
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

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
