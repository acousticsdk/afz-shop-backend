import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { steamRouter } from './routes/steam.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { config } from './config.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Request parsing
app.use(express.json());

// Logging
app.use(requestLogger);

// Routes
app.use('/steam', steamRouter);

// Error handling
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});