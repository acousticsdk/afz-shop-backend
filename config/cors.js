import cors from 'cors';

export const corsConfig = cors({
    origin: '*', // Разрешаем ВРЕМЕННО все источники
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
});

// Middleware для предварительных запросов OPTIONS
export const handlePreflight = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
        res.header('Access-Control-Max-Age', '86400'); // 24 часа
        return res.status(204).send();
    }
    next();
};
